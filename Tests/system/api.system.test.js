/**
 * Tests système API HTTP (génériques — dépôts / comptes publics)
 * Prérequis : serveur Next démarré (npm run dev)
 * Skip automatique si le serveur n'est pas joignable ou rate limit GitHub.
 *
 * Variables optionnelles :
 *   BASE_URL=http://localhost:3000
 *   GITHUB_TOKEN=...   (recommandé pour éviter le rate limit)
 */

var BASE = process.env.BASE_URL || "http://localhost:3000";

// comptes / dépôts publics génériques uniquement
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
    console.warn("[Tests system] Rate limit GitHub — assertion assouplie.");
    return true;
  }
  return false;
}

var canRun = false;

beforeAll(async function () {
  canRun = await serverUp();
  if (!canRun) {
    console.warn(
      "[Tests system] Serveur non disponible sur " +
        BASE +
        " — tests système ignorés. Lance `npm run dev` puis `npm run test:system`."
    );
  }
});

describe("TC-S-API — tests système API (si serveur up)", function () {
  test("TC-S-API-01 page d'accueil répond", async function () {
    if (!canRun) {
      return;
    }
    var res = await fetch(BASE + "/");
    expect(res.status).toBe(200);
    var html = await res.text();
    expect(html).toMatch(/GitHub Analytics|Analyser/i);
    expect(html).not.toMatch(/ghp_/);
  });

  test("TC-S-API-02 repo public infos", async function () {
    if (!canRun) {
      return;
    }
    var result = await getJson("/api/repo/" + PUBLIC_REPO_DOT);
    if (skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(200);
    expect(result.data.full_name).toBe(PUBLIC_REPO_DOT);
    expect(result.data.stargazers_count).toBeGreaterThan(0);
  });

  test("TC-S-API-03 langages multi + somme ~100", async function () {
    if (!canRun) {
      return;
    }
    var result = await getJson("/api/repo/" + PUBLIC_REPO + "/languages");
    if (skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(200);
    expect(result.data.detected).toBe(true);
    expect(result.data.languageCount).toBeGreaterThanOrEqual(3);
    expect(result.data.documentationOnly).not.toBe(true);
    var sum = 0;
    var langs = result.data.languages || [];
    var i;
    for (i = 0; i < langs.length; i++) {
      sum = sum + langs[i].percent;
    }
    expect(sum).toBeCloseTo(100, 0);
  });

  test("TC-S-API-04 repo introuvable → 404 FR", async function () {
    if (!canRun) {
      return;
    }
    var result = await getJson("/api/repo/zzz-no-owner/zzz-no-repo");
    if (skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(404);
    expect(result.data.error).toBe("not_found");
    expect(result.data.message.toLowerCase()).toMatch(/introuvable/);
  });

  test("TC-S-API-05 token invalide → 401", async function () {
    if (!canRun) {
      return;
    }
    var result = await getJson(
      "/api/repo/" + PUBLIC_REPO,
      "ghp_INVALIDTOKEN123456789012345678901234"
    );
    // avec un faux token GitHub renvoie souvent 401
    if (skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(401);
    expect(result.data.error).toBe("unauthorized");
  });

  test("TC-S-API-06 commits agrégés", async function () {
    if (!canRun) {
      return;
    }
    var result = await getJson("/api/repo/" + PUBLIC_REPO_DOT + "/commits");
    if (skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(200);
    expect(result.data.total).toBeGreaterThan(0);
    expect(result.data.byWeekday.length).toBe(7);
    expect(result.data.byHour.length).toBe(24);
  });

  test("TC-S-API-07 analyse compte utilisateur public", async function () {
    if (!canRun) {
      return;
    }
    var profile = await getJson("/api/user/" + PUBLIC_USER);
    if (skipIfRateLimited(profile)) {
      return;
    }
    expect(profile.status).toBe(200);
    expect(profile.data.login).toBe(PUBLIC_USER);

    var repos = await getJson("/api/user/" + PUBLIC_USER + "/repos");
    if (skipIfRateLimited(repos)) {
      return;
    }
    expect(repos.status).toBe(200);
    expect(repos.data.repoCount).toBeGreaterThan(0);
    expect(repos.data.languagesByRepos).toBeTruthy();
  });

  test("TC-S-API-08 page user HTML", async function () {
    if (!canRun) {
      return;
    }
    var res = await fetch(BASE + "/user/" + PUBLIC_USER);
    expect(res.status).toBe(200);
  });
});
