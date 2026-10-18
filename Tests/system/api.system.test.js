/**
 * Tests système API HTTP (dépôts / comptes publics génériques)
 * Prérequis : next start + faux GitHub (npm run build puis npm run test:server)
 * Serveur absent = échec. Aucun appel au vrai GitHub : réponses figées.
 */

var http = require("../helpers/http");

beforeAll(http.requireServer);

describe("TC-S-API : tests système API", function () {
  test("TC-S-API-01 page d'accueil répond avec les en-têtes de sécurité", async function () {
    var res = await fetch(http.BASE + "/");
    expect(res.status).toBe(200);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("content-security-policy")).toMatch(
      /frame-ancestors 'none'/
    );
    var html = await res.text();
    expect(html).toMatch(/GitHub Analytics|Analyser/i);
    expect(html).not.toMatch(/ghp_/);
  });

  test("TC-S-API-02 repo public infos", async function () {
    var result = await http.getJson("/api/repo/" + http.PUBLIC_REPO_DOT);
    expect(result.status).toBe(200);
    expect(result.data.full_name).toBe(http.PUBLIC_REPO_DOT);
    expect(result.data.stargazers_count).toBe(1200);
  });

  test("TC-S-API-03 langages multiples, somme de 100", async function () {
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO + "/languages"
    );
    expect(result.status).toBe(200);
    expect(result.data.detected).toBe(true);
    expect(result.data.languageCount).toBe(4);
    expect(result.data.documentationOnly).toBe(false);
    var sum = 0;
    var i;
    for (i = 0; i < result.data.languages.length; i++) {
      sum = sum + result.data.languages[i].percent;
    }
    expect(sum).toBe(100);
  });

  test("TC-S-API-04 repo introuvable : 404 FR", async function () {
    var result = await http.getJson("/api/repo/zzz-no-owner/zzz-no-repo");
    expect(result.status).toBe(404);
    expect(result.data.error).toBe("not_found");
    expect(result.data.message.toLowerCase()).toMatch(/introuvable/);
  });

  test("TC-S-API-05 token invalide : 401", async function () {
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO,
      http.INVALID_TOKEN
    );
    expect(result.status).toBe(401);
    expect(result.data.error).toBe("unauthorized");
  });

  test("TC-S-API-06 commits agrégés", async function () {
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO_DOT + "/commits"
    );
    expect(result.status).toBe(200);
    expect(result.data.total).toBe(6);
    expect(result.data.activeDays).toBe(5);
    expect(result.data.spanDays).toBe(7);
    expect(result.data.authorCount).toBe(3);
    expect(result.data.peakDay).toEqual({ date: "2026-10-12", count: 2 });
    expect(result.data.peakWeekday).toEqual({ day: "Lun", count: 2 });
    expect(result.data.peakHour.hourNum).toBe(9);
    expect(result.data.peakHour.count).toBe(3);
    expect(result.data.byWeekday.length).toBe(7);
    expect(result.data.byHour.length).toBe(24);
    var weekTotal = 0;
    var hourTotal = 0;
    var i;
    for (i = 0; i < result.data.byWeekday.length; i++) {
      weekTotal = weekTotal + result.data.byWeekday[i].count;
    }
    for (i = 0; i < result.data.byHour.length; i++) {
      hourTotal = hourTotal + result.data.byHour[i].count;
    }
    expect(weekTotal).toBe(6);
    expect(hourTotal).toBe(6);
  });

  test("TC-S-API-07 analyse compte utilisateur public", async function () {
    var profile = await http.getJson("/api/user/" + http.PUBLIC_USER);
    expect(profile.status).toBe(200);
    expect(profile.data.login).toBe(http.PUBLIC_USER);

    var repos = await http.getJson("/api/user/" + http.PUBLIC_USER + "/repos");
    expect(repos.status).toBe(200);
    expect(repos.data.repoCount).toBe(3);
    expect(repos.data.languagesByRepos.languageCount).toBe(2);
  });

  test("TC-S-API-08 page user HTML", async function () {
    var res = await fetch(http.BASE + "/user/" + http.PUBLIC_USER);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/html/);
  });

  test("TC-S-API-09 dépôt transféré : 200 sur la nouvelle cible, pas 500", async function () {
    var result = await http.getJson(
      "/api/repo/" + http.TRANSFERRED_REPO + "/languages"
    );
    expect(result.status).toBe(200);
    expect(result.data.languageCount).toBe(3);
    var names = result.data.languages.map(function (l) {
      return l.name;
    });
    expect(names).toEqual(["JavaScript", "HTML", "CSS"]);
  });
});
