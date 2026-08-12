/**
 * Tests fonctionnels — cas d'utilisation « Analyser un compte GitHub »
 * Prérequis : serveur Next (npm run dev)
 */

var http = require("../helpers/http");

var canRun = false;

beforeAll(async function () {
  canRun = await http.serverUp();
  if (!canRun) {
    console.warn(
      "[TF-USER] Serveur absent sur " +
        http.BASE +
        " — scénarios skip. Lance npm run dev."
    );
  }
});

describe("TF-USER — analyser un compte public", function () {
  test("TF-USER-01 le profil public est récupérable", async function () {
    if (!canRun) {
      return;
    }
    var result = await http.getJson("/api/user/" + http.PUBLIC_USER);
    if (http.skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(200);
    expect(result.data.login).toBe(http.PUBLIC_USER);
    expect(result.data.html_url).toMatch(/github\.com/);
    expect(typeof result.data.public_repos).toBe("number");
    expect(result.data.ageLabel).toBeTruthy();
  });

  test("TF-USER-02 la synthèse des dépôts du compte est calculée", async function () {
    if (!canRun) {
      return;
    }
    var result = await http.getJson(
      "/api/user/" + http.PUBLIC_USER + "/repos"
    );
    if (http.skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(200);
    expect(result.data.repoCount).toBeGreaterThan(0);
    expect(typeof result.data.totalStars).toBe("number");
    expect(result.data.languagesByRepos).toBeTruthy();
    expect(Array.isArray(result.data.topByStars)).toBe(true);
    expect(Array.isArray(result.data.allRepos)).toBe(true);
    expect(result.data.allRepos.length).toBe(result.data.repoCount);
  });

  test("TF-USER-03 parcours complet profil puis dépôts", async function () {
    if (!canRun) {
      return;
    }
    var profile = await http.getJson("/api/user/" + http.PUBLIC_USER);
    if (http.skipIfRateLimited(profile)) {
      return;
    }
    expect(profile.status).toBe(200);

    var repos = await http.getJson(
      "/api/user/" + http.PUBLIC_USER + "/repos"
    );
    if (http.skipIfRateLimited(repos)) {
      return;
    }
    expect(repos.status).toBe(200);

    // le compte a bien des dépôts analysables
    expect(repos.data.repoCount).toBeGreaterThan(0);
    expect(repos.data.username).toBe(http.PUBLIC_USER);
  });

  test("TF-USER-04 la page HTML du compte s'affiche", async function () {
    if (!canRun) {
      return;
    }
    var page = await http.getHtml("/user/" + http.PUBLIC_USER);
    expect(page.status).toBe(200);
    expect(page.html.length).toBeGreaterThan(100);
  });
});
