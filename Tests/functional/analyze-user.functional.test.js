/**
 * Tests fonctionnels : cas d'utilisation « Analyser un compte GitHub »
 * Prérequis : next start + faux GitHub (npm run test:server)
 */

var http = require("../helpers/http");

beforeAll(http.requireServer);

describe("TF-USER : analyser un compte public", function () {
  test("TF-USER-01 le profil public est récupérable", async function () {
    var result = await http.getJson("/api/user/" + http.PUBLIC_USER);
    expect(result.status).toBe(200);
    expect(result.data.login).toBe(http.PUBLIC_USER);
    expect(result.data.type).toBe("User");
    expect(result.data.html_url).toBe("https://github.com/octocat");
    expect(result.data.public_repos).toBe(3);
    expect(result.data.ageLabel).toBeTruthy();
  });

  test("TF-USER-02 la synthèse des dépôts du compte est calculée", async function () {
    var result = await http.getJson(
      "/api/user/" + http.PUBLIC_USER + "/repos"
    );
    expect(result.status).toBe(200);
    expect(result.data.repoCount).toBe(3);
    expect(result.data.totalStars).toBe(100);
    expect(result.data.forksCount).toBe(1);
    expect(result.data.originalCount).toBe(2);
    expect(result.data.languagesByRepos.languageCount).toBe(2);
    expect(result.data.topByStars[0].name).toBe("Hello-World");
    expect(result.data.allRepos.length).toBe(result.data.repoCount);
    expect(result.data.isOrg).toBe(false);
  });

  test("TF-USER-03 parcours complet profil puis dépôts", async function () {
    var profile = await http.getJson("/api/user/" + http.PUBLIC_USER);
    var repos = await http.getJson(
      "/api/user/" + http.PUBLIC_USER + "/repos"
    );
    expect(profile.status).toBe(200);
    expect(repos.status).toBe(200);
    // le compte a bien les dépôts annoncés par son profil
    expect(repos.data.repoCount).toBe(profile.data.public_repos);
    expect(repos.data.username).toBe(http.PUBLIC_USER);
  });

  test("TF-USER-04 la page HTML du compte s'affiche", async function () {
    var page = await http.getHtml("/user/" + http.PUBLIC_USER);
    expect(page.status).toBe(200);
    expect(page.html).toMatch(/<html/i);
    expect(page.html.length).toBeGreaterThan(100);
  });
});
