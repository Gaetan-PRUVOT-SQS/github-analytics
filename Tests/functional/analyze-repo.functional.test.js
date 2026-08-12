/**
 * Tests fonctionnels — cas d'utilisation « Analyser un dépôt »
 * Prérequis : serveur Next (npm run dev)
 * Données : dépôts publics génériques uniquement
 */

var http = require("../helpers/http");

var canRun = false;

beforeAll(async function () {
  canRun = await http.serverUp();
  if (!canRun) {
    console.warn(
      "[TF-REPO] Serveur absent sur " +
        http.BASE +
        " — scénarios skip. Lance npm run dev."
    );
  }
});

describe("TF-REPO — analyser un dépôt public", function () {
  test("TF-REPO-01 le dépôt renvoie ses infos principales", async function () {
    if (!canRun) {
      return;
    }
    var result = await http.getJson("/api/repo/" + http.PUBLIC_REPO_DOT);
    if (http.skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(200);
    expect(result.data.full_name).toBe(http.PUBLIC_REPO_DOT);
    expect(typeof result.data.stargazers_count).toBe("number");
    expect(result.data.html_url).toMatch(/github\.com/);
    expect(result.data.ageLabel).toBeTruthy();
  });

  test("TF-REPO-02 les langages sont listés avec des pourcentages totaux ~100", async function () {
    if (!canRun) {
      return;
    }
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO + "/languages"
    );
    if (http.skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(200);
    expect(result.data.detected).toBe(true);
    expect(result.data.languageCount).toBeGreaterThan(0);
    expect(Array.isArray(result.data.languages)).toBe(true);

    var sum = 0;
    var i;
    for (i = 0; i < result.data.languages.length; i++) {
      var lang = result.data.languages[i];
      expect(lang.name).toBeTruthy();
      expect(typeof lang.percent).toBe("number");
      expect(lang.percentLabel).toBeTruthy();
      sum = sum + lang.percent;
    }
    expect(sum).toBeCloseTo(100, 0);
  });

  test("TF-REPO-03 les contributeurs sont listés avec un pourcentage", async function () {
    if (!canRun) {
      return;
    }
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO + "/contributors"
    );
    if (http.skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(200);
    expect(result.data.contributorCount).toBeGreaterThan(0);
    expect(result.data.contributors[0].login).toBeTruthy();
    expect(typeof result.data.contributors[0].percent).toBe("number");
  });

  test("TF-REPO-04 l'analyse des commits fournit timeline et jours de semaine", async function () {
    if (!canRun) {
      return;
    }
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO_DOT + "/commits"
    );
    if (http.skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(200);
    expect(result.data.total).toBeGreaterThan(0);
    expect(Array.isArray(result.data.timeline)).toBe(true);
    expect(result.data.byWeekday.length).toBe(7);
    expect(result.data.byHour.length).toBe(24);
    expect(Array.isArray(result.data.heatmap)).toBe(true);
    expect(Array.isArray(result.data.topAuthors)).toBe(true);
  });

  test("TF-REPO-05 issues, pulls et releases répondent", async function () {
    if (!canRun) {
      return;
    }
    var issues = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO + "/issues"
    );
    var pulls = await http.getJson("/api/repo/" + http.PUBLIC_REPO + "/pulls");
    var releases = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO + "/releases"
    );
    if (
      http.skipIfRateLimited(issues) ||
      http.skipIfRateLimited(pulls) ||
      http.skipIfRateLimited(releases)
    ) {
      return;
    }
    expect(issues.status).toBe(200);
    expect(Array.isArray(issues.data.issues)).toBe(true);
    expect(pulls.status).toBe(200);
    expect(Array.isArray(pulls.data.pulls)).toBe(true);
    expect(releases.status).toBe(200);
    expect(Array.isArray(releases.data.releases)).toBe(true);
  });

  test("TF-REPO-06 parcours complet : infos + langages + commits enchaînés", async function () {
    if (!canRun) {
      return;
    }
    var base = "/api/repo/" + http.PUBLIC_REPO_DOT;
    var info = await http.getJson(base);
    if (http.skipIfRateLimited(info)) {
      return;
    }
    expect(info.status).toBe(200);

    var langs = await http.getJson(base + "/languages");
    if (http.skipIfRateLimited(langs)) {
      return;
    }
    expect(langs.status).toBe(200);

    var commits = await http.getJson(base + "/commits");
    if (http.skipIfRateLimited(commits)) {
      return;
    }
    expect(commits.status).toBe(200);

    // cohérence fonctionnelle : le dépôt analysé est le même
    expect(info.data.name).toBe("next.js");
    expect(langs.data.languageCount).toBeGreaterThan(0);
    expect(commits.data.total).toBeGreaterThan(0);
  });
});
