// helpers HTTP pour tests fonctionnels / système

var BASE = process.env.BASE_URL || "http://localhost:3000";

// données publiques génériques uniquement
var PUBLIC_USER = "octocat";
var PUBLIC_REPO = "facebook/react";
var PUBLIC_REPO_DOT = "vercel/next.js";

async function serverUp() {
  try {
    var res = await fetch(BASE + "/", { method: "GET" });
    return res.status > 0;
  } catch (e) {
    return false;
  }
}

async function getJson(path, token) {
  var headers = { Accept: "application/json" };
  if (token) {
    headers["x-github-token"] = token;
  } else if (process.env.GITHUB_TOKEN) {
    headers["x-github-token"] = process.env.GITHUB_TOKEN;
  }
  var res = await fetch(BASE + path, { headers: headers });
  var data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, data: data };
}

async function getHtml(path) {
  var res = await fetch(BASE + path, { method: "GET" });
  var text = "";
  try {
    text = await res.text();
  } catch (e) {
    text = "";
  }
  return { status: res.status, html: text };
}

function isRateLimited(result) {
  if (!result) {
    return false;
  }
  if (result.status === 403 || result.status === 429) {
    return true;
  }
  if (result.data && result.data.error === "rate_limit") {
    return true;
  }
  return false;
}

function skipIfRateLimited(result) {
  if (isRateLimited(result)) {
    console.warn("[Tests] Rate limit GitHub — scénario assoupli.");
    return true;
  }
  return false;
}

module.exports = {
  BASE,
  PUBLIC_USER,
  PUBLIC_REPO,
  PUBLIC_REPO_DOT,
  serverUp,
  getJson,
  getHtml,
  isRateLimited,
  skipIfRateLimited,
};
