// règles de sécurité simples pour les entrées utilisateur

var MAX_NAME_LENGTH = 100;
var MAX_TOKEN_LENGTH = 255;
// noms GitHub : lettres, chiffres, tiret, underscore, point
var NAME_REGEX = /^[A-Za-z0-9_.-]+$/;

function validateGitHubName(raw, label) {
  var field = label || "nom";

  if (raw === null || raw === undefined) {
    return {
      ok: false,
      value: null,
      message: "Le " + field + " est manquant.",
    };
  }

  var value = String(raw).trim();

  // décoder une seule fois si encodé dans l'URL
  try {
    value = decodeURIComponent(value);
  } catch (e) {
    return {
      ok: false,
      value: null,
      message: "Le " + field + " est invalide.",
    };
  }

  value = value.trim();

  if (value === "") {
    return {
      ok: false,
      value: null,
      message: "Le " + field + " est vide.",
    };
  }

  if (value.length > MAX_NAME_LENGTH) {
    return {
      ok: false,
      value: null,
      message: "Le " + field + " est trop long.",
    };
  }

  // bloque path traversal et caractères dangereux
  if (
    value.indexOf("..") !== -1 ||
    value.indexOf("/") !== -1 ||
    value.indexOf("\\") !== -1 ||
    value.indexOf("\0") !== -1
  ) {
    return {
      ok: false,
      value: null,
      message: "Le " + field + " contient des caractères interdits.",
    };
  }

  if (!NAME_REGEX.test(value)) {
    return {
      ok: false,
      value: null,
      message: "Le " + field + " a un format invalide.",
    };
  }

  return {
    ok: true,
    value: value,
    message: null,
  };
}

function validateRepoParams(ownerRaw, repoRaw) {
  var owner = validateGitHubName(ownerRaw, "propriétaire");
  if (!owner.ok) {
    return {
      ok: false,
      owner: null,
      repo: null,
      message: owner.message,
    };
  }

  var repo = validateGitHubName(repoRaw, "dépôt");
  if (!repo.ok) {
    return {
      ok: false,
      owner: null,
      repo: null,
      message: repo.message,
    };
  }

  return {
    ok: true,
    owner: owner.value,
    repo: repo.value,
    message: null,
  };
}

function validateUsername(usernameRaw) {
  var result = validateGitHubName(usernameRaw, "nom d'utilisateur");
  if (!result.ok) {
    return {
      ok: false,
      username: null,
      message: result.message,
    };
  }
  return {
    ok: true,
    username: result.value,
    message: null,
  };
}

// nettoie un token collé (ne le log jamais)
function sanitizeToken(raw) {
  if (!raw || typeof raw !== "string") {
    return null;
  }

  var token = raw.trim();
  if (token === "") {
    return null;
  }

  if (token.length > MAX_TOKEN_LENGTH) {
    return null;
  }

  // refuse les retours ligne (injection header)
  if (token.indexOf("\n") !== -1 || token.indexOf("\r") !== -1) {
    return null;
  }

  // caractères attendus pour un PAT GitHub
  if (!/^[A-Za-z0-9_]+$/.test(token)) {
    return null;
  }

  return token;
}

// chemin API GitHub relatif uniquement (anti-SSRF)
function isSafeGithubApiPath(path) {
  if (!path || typeof path !== "string") {
    return false;
  }
  if (path.charAt(0) !== "/") {
    return false;
  }
  if (path.indexOf("://") !== -1) {
    return false;
  }
  if (path.indexOf("..") !== -1) {
    return false;
  }
  if (path.indexOf("//") !== -1) {
    return false;
  }
  if (path.indexOf("\\") !== -1) {
    return false;
  }
  if (path.indexOf("@") !== -1) {
    return false;
  }
  if (path.length > 500) {
    return false;
  }
  return true;
}

function badRequest(message) {
  return Response.json(
    {
      error: "bad_request",
      message: message || "Requête invalide.",
    },
    { status: 400 }
  );
}

export {
  MAX_NAME_LENGTH,
  MAX_TOKEN_LENGTH,
  validateGitHubName,
  validateRepoParams,
  validateUsername,
  sanitizeToken,
  isSafeGithubApiPath,
  badRequest,
};
