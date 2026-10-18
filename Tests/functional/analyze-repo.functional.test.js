/**
 * Tests fonctionnels : cas d'utilisation « Analyser un dépôt »
 * Prérequis : next start + faux GitHub (npm run test:server)
 * Données : réponses figées de dépôts publics génériques (Tests/fixtures/github.js)
 */

var http = require("../helpers/http");

beforeAll(http.requireServer);

describe("TF-REPO : analyser un dépôt public", function () {
  test("TF-REPO-01 le dépôt renvoie ses infos principales", async function () {
    var result = await http.getJson("/api/repo/" + http.PUBLIC_REPO_DOT);
    expect(result.status).toBe(200);
    expect(result.data.full_name).toBe(http.PUBLIC_REPO_DOT);
    expect(result.data.stargazers_count).toBe(1200);
    expect(result.data.forks_count).toBe(300);
    expect(result.data.starsPerFork).toBe(4);
    expect(result.data.license).toBe("MIT");
    expect(result.data.html_url).toBe("https://github.com/vercel/next.js");
    expect(result.data.ageLabel).toBeTruthy();
  });

  test("TF-REPO-02 les langages sont listés avec des pourcentages totaux de 100", async function () {
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO + "/languages"
    );
    expect(result.status).toBe(200);
    expect(result.data.detected).toBe(true);
    expect(result.data.source).toBe("github");
    expect(result.data.languageCount).toBe(4);

    var names = [];
    var percents = [];
    var sum = 0;
    var i;
    for (i = 0; i < result.data.languages.length; i++) {
      var lang = result.data.languages[i];
      names.push(lang.name);
      percents.push(lang.percent);
      expect(lang.percentLabel).toBe(lang.percent.toFixed(2) + " %");
      sum = sum + lang.percent;
    }
    expect(names).toEqual(["JavaScript", "C++", "Python", "C"]);
    expect(percents).toEqual([50, 30, 15, 5]);
    expect(sum).toBe(100);
  });

  test("TF-REPO-03 les contributeurs sont listés avec un pourcentage", async function () {
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO + "/contributors"
    );
    expect(result.status).toBe(200);
    expect(result.data.contributorCount).toBe(3);
    expect(result.data.totalContributions).toBe(100);
    expect(result.data.contributors[0].login).toBe("alice");
    expect(result.data.contributors[0].percent).toBe(60);
    expect(result.data.topContributor.login).toBe("alice");
  });

  test("TF-REPO-04 l'analyse des commits fournit timeline et jours de semaine", async function () {
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO_DOT + "/commits"
    );
    expect(result.status).toBe(200);
    expect(result.data.total).toBe(6);
    expect(result.data.timeline.length).toBe(5);
    expect(result.data.firstDate).toBe("2026-10-12");
    expect(result.data.lastDate).toBe("2026-10-18");
    expect(
      result.data.byWeekday.map(function (d) {
        return d.count;
      })
    ).toEqual([2, 1, 0, 1, 0, 1, 1]);
    expect(result.data.byHour.length).toBe(24);
    expect(result.data.byHour[9].count).toBe(3);
    expect(result.data.heatmap.length).toBe(5);
    expect(result.data.topAuthors[0]).toEqual({
      login: "alice",
      count: 3,
      percent: 50,
    });
  });

  test("TF-REPO-05 issues, pulls et releases répondent", async function () {
    var base = "/api/repo/" + http.PUBLIC_REPO;
    var issues = await http.getJson(base + "/issues");
    var pulls = await http.getJson(base + "/pulls");
    var releases = await http.getJson(base + "/releases");

    expect(issues.status).toBe(200);
    // la PR renvoyée par /issues est filtrée
    expect(issues.data.count).toBe(2);
    expect(
      issues.data.issues.map(function (i) {
        return i.number;
      })
    ).toEqual([3, 1]);
    expect(pulls.status).toBe(200);
    expect(pulls.data.count).toBe(1);
    expect(pulls.data.pulls[0].user).toBe("alice");
    expect(releases.status).toBe(200);
    expect(releases.data.releases.length).toBe(2);
    expect(releases.data.releases[0].tag_name).toBe("v24.22.0");
  });

  test("TF-REPO-06 parcours complet : infos + langages + commits enchaînés", async function () {
    var base = "/api/repo/" + http.PUBLIC_REPO_DOT;
    var info = await http.getJson(base);
    var langs = await http.getJson(base + "/languages");
    var commits = await http.getJson(base + "/commits");

    expect(info.status).toBe(200);
    expect(langs.status).toBe(200);
    expect(commits.status).toBe(200);
    // cohérence fonctionnelle : le dépôt analysé est le même
    expect(info.data.name).toBe("next.js");
    expect(langs.data.dominant.name).toBe("JavaScript");
    expect(langs.data.languageCount).toBe(3);
    expect(commits.data.total).toBe(6);
  });

  test("TF-REPO-07 dépôt transféré : la redirection GitHub est suivie", async function () {
    var info = await http.getJson("/api/repo/" + http.TRANSFERRED_REPO);
    expect(info.status).toBe(200);
    expect(info.data.full_name).toBe("react/react");

    var langs = await http.getJson(
      "/api/repo/" + http.TRANSFERRED_REPO + "/languages"
    );
    expect(langs.status).toBe(200);
    expect(langs.data.languageCount).toBe(3);
    expect(langs.data.dominant.name).toBe("JavaScript");
    expect(langs.data.dominant.percent).toBe(80);
  });
});
