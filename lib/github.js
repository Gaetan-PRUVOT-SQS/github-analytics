import { sanitizeToken, isSafeGithubApiPath } from "./security";

const GITHUB_API_ORIGIN = "https://api.github.com";
const GITHUB_API_HOST = "api.github.com";
const MAX_REDIRECTS = 3;
const REDIRECT_STATUSES = [301, 302, 303, 307, 308];
// seule autre base acceptée : un faux GitHub local pour les tests serveur
const LOCAL_API_BASE_REGEX = /^http:\/\/127\.0\.0\.1:[0-9]{1,5}$/;

function getTokenFromRequest(request) {
  const headerToken = request.headers.get("x-github-token");
  const cleanedHeader = sanitizeToken(headerToken);
  if (cleanedHeader) {
    return cleanedHeader;
  }

  const envToken = sanitizeToken(process.env.GITHUB_TOKEN || "");
  if (envToken) {
    return envToken;
  }

  return null;
}

// base réelle des appels : api.github.com, ou 127.0.0.1 pour les tests
function getApiBase() {
  const raw = process.env.GITHUB_API_BASE;
  if (raw === undefined || raw === "") {
    return GITHUB_API_ORIGIN;
  }
  if (raw === GITHUB_API_ORIGIN || LOCAL_API_BASE_REGEX.test(raw)) {
    return raw;
  }
  return null;
}

function failure(status, errorCode, message) {
  return {
    ok: false,
    status: status,
    data: null,
    errorCode: errorCode,
    message: message,
  };
}

// valide une cible de redirection : https, hôte exact api.github.com, chemin sûr.
// renvoie le chemin relatif à suivre, ou null si la cible est refusée
function redirectPath(location, currentPath) {
  if (!location || typeof location !== "string") {
    return null;
  }

  let target;
  try {
    target = new URL(location, GITHUB_API_ORIGIN + currentPath);
  } catch (e) {
    return null;
  }

  if (target.protocol !== "https:") {
    return null;
  }
  // host contient aussi le port : un port explicite est refusé
  if (target.host !== GITHUB_API_HOST) {
    return null;
  }
  if (target.username !== "" || target.password !== "") {
    return null;
  }

  const path = target.pathname + target.search;
  if (!isSafeGithubApiPath(path)) {
    return null;
  }
  return path;
}

async function githubFetch(path, token) {
  // sécurité : uniquement des chemins relatifs vers api.github.com
  if (!isSafeGithubApiPath(path)) {
    return failure(400, "bad_request", "Chemin API invalide.");
  }

  const apiBase = getApiBase();
  if (!apiBase) {
    return failure(500, "config_error", "Configuration serveur invalide.");
  }

  const safeToken = sanitizeToken(token);
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "GitHub-Analytics-App",
  };

  if (safeToken) {
    headers.Authorization = "Bearer " + safeToken;
  }

  let currentPath = path;
  let hops = 0;
  let response = null;

  try {
    // redirections suivies à la main : chaque saut est revalidé, et la
    // requête part toujours vers apiBase, donc le token ne quitte jamais GitHub
    while (response === null) {
      const current = await fetch(apiBase + currentPath, {
        headers: headers,
        cache: "no-store",
        redirect: "manual",
      });

      if (REDIRECT_STATUSES.indexOf(current.status) === -1) {
        response = current;
        break;
      }

      if (hops >= MAX_REDIRECTS) {
        return failure(
          502,
          "too_many_redirects",
          "Trop de redirections depuis l'API GitHub."
        );
      }

      const nextPath = redirectPath(
        current.headers.get("location"),
        currentPath
      );
      if (!nextPath) {
        return failure(
          502,
          "bad_redirect",
          "Redirection refusée : elle ne pointe pas vers api.github.com en HTTPS."
        );
      }

      currentPath = nextPath;
      hops = hops + 1;
    }
  } catch (error) {
    return failure(502, "network", "Erreur réseau. Réessaie dans un instant.");
  }

  if (response.status === 404) {
    return failure(404, "not_found", "Dépôt introuvable");
  }

  if (response.status === 401) {
    return failure(
      401,
      "unauthorized",
      "Token invalide. Vérifie ton token GitHub."
    );
  }

  if (response.status === 403 || response.status === 429) {
    return failure(
      response.status,
      "rate_limit",
      "Limite API atteinte. Ajoute un token GitHub pour continuer."
    );
  }

  // panne côté GitHub : passerelle en erreur, pas une erreur de l'app
  if (response.status >= 500) {
    return failure(
      502,
      "api_error",
      "Erreur API GitHub (" + response.status + ")"
    );
  }

  if (!response.ok) {
    return failure(
      response.status,
      "api_error",
      "Erreur API GitHub (" + response.status + ")"
    );
  }

  try {
    const data = await response.json();
    return {
      ok: true,
      status: response.status,
      data: data,
      errorCode: null,
      message: null,
    };
  } catch (error) {
    return failure(502, "bad_response", "Réponse invalide de l'API GitHub.");
  }
}

function jsonError(result) {
  return Response.json(
    {
      error: result.errorCode,
      message: result.message,
    },
    { status: result.status || 500 }
  );
}

function jsonOk(data) {
  return Response.json(data);
}

export {
  MAX_REDIRECTS,
  getTokenFromRequest,
  getApiBase,
  githubFetch,
  jsonError,
  jsonOk,
};
