// helpers HTTP pour tests fonctionnels / système
// le serveur visé est un vrai `next start` branché sur le faux GitHub
// (voir scripts/test-server.mjs) : lancer `npm run test:server`

var fixtures = require("../fixtures/github");

var BASE = process.env.BASE_URL || "http://127.0.0.1:3000";

// données publiques génériques uniquement (réponses figées dans Tests/fixtures)
var PUBLIC_USER = "octocat";
var PUBLIC_REPO = "nodejs/node";
var PUBLIC_REPO_DOT = "vercel/next.js";
// dépôt transféré : l'API GitHub répond 301 vers react/react
var TRANSFERRED_REPO = "facebook/react";
var INVALID_TOKEN = fixtures.INVALID_TOKEN;

// serveur absent = échec clair, jamais un test qui passe à vide
async function requireServer() {
  try {
    await fetch(BASE + "/", { method: "GET" });
  } catch (e) {
    throw new Error(
      "Serveur absent sur " +
        BASE +
        ". Lance `npm run build` puis `npm run test:server` (next start + faux GitHub)."
    );
  }
}

async function getJson(path, token) {
  var headers = { Accept: "application/json" };
  if (token) {
    headers["x-github-token"] = token;
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
  var text = await res.text();
  return { status: res.status, html: text };
}

module.exports = {
  BASE,
  PUBLIC_USER,
  PUBLIC_REPO,
  PUBLIC_REPO_DOT,
  TRANSFERRED_REPO,
  INVALID_TOKEN,
  requireServer,
  getJson,
  getHtml,
};
