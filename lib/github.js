import { sanitizeToken, isSafeGithubApiPath } from "./security";

function getTokenFromRequest(request) {
  var headerToken = request.headers.get("x-github-token");
  var cleanedHeader = sanitizeToken(headerToken);
  if (cleanedHeader) {
    return cleanedHeader;
  }

  var envToken = sanitizeToken(process.env.GITHUB_TOKEN || "");
  if (envToken) {
    return envToken;
  }

  return null;
}

async function githubFetch(path, token) {
  // sécurité : uniquement des chemins relatifs vers api.github.com
  if (!isSafeGithubApiPath(path)) {
    return {
      ok: false,
      status: 400,
      data: null,
      errorCode: "bad_request",
      message: "Chemin API invalide.",
    };
  }

  var safeToken = sanitizeToken(token);
  var url = "https://api.github.com" + path;
  var headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "GitHub-Analytics-App",
  };

  if (safeToken) {
    headers.Authorization = "Bearer " + safeToken;
  }

  try {
    var response = await fetch(url, {
      headers: headers,
      cache: "no-store",
      redirect: "error",
    });

    if (response.status === 404) {
      return {
        ok: false,
        status: 404,
        data: null,
        errorCode: "not_found",
        message: "Dépôt introuvable",
      };
    }

    if (response.status === 401) {
      return {
        ok: false,
        status: 401,
        data: null,
        errorCode: "unauthorized",
        message: "Token invalide. Vérifie ton token GitHub.",
      };
    }

    if (response.status === 403 || response.status === 429) {
      return {
        ok: false,
        status: response.status,
        data: null,
        errorCode: "rate_limit",
        message: "Limite API atteinte. Ajoute un token GitHub pour continuer.",
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: null,
        errorCode: "api_error",
        message: "Erreur API GitHub (" + response.status + ")",
      };
    }

    var data = await response.json();
    return {
      ok: true,
      status: response.status,
      data: data,
      errorCode: null,
      message: null,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      errorCode: "network",
      message: "Erreur réseau. Réessaie dans un instant.",
    };
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

export { getTokenFromRequest, githubFetch, jsonError, jsonOk };
