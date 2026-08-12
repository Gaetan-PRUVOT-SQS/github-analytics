function getSessionToken() {
  if (typeof window === "undefined") {
    return null;
  }
  var token = sessionStorage.getItem("github_token");
  if (token && token.trim() !== "") {
    return token.trim();
  }
  return null;
}

async function clientFetch(path) {
  var headers = {
    Accept: "application/json",
  };
  var token = getSessionToken();
  if (token) {
    headers["x-github-token"] = token;
  }

  try {
    var response = await fetch(path, {
      headers: headers,
      cache: "no-store",
    });
    var data = await response.json();
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: null,
        message: data.message || "Erreur serveur",
        error: data.error || "api_error",
      };
    }
    return {
      ok: true,
      status: response.status,
      data: data,
      message: null,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      message: "Erreur réseau. Réessaie dans un instant.",
      error: "network",
    };
  }
}

export { getSessionToken, clientFetch };
