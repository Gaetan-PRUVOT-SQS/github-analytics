/**
 * Unitaire
 * Module : lib/userStats.js (analyse compte entier)
 */

import { aggregateRepos } from "../../lib/userStats";

describe("TC-U-USER — aggregateRepos", function () {
  var sampleRepos = [
    {
      name: "app-a",
      full_name: "u/app-a",
      language: "JavaScript",
      stargazers_count: 10,
      forks_count: 2,
      watchers_count: 10,
      open_issues_count: 1,
      size: 100,
      fork: false,
      archived: false,
      pushed_at: "2026-08-01T00:00:00Z",
      updated_at: "2026-08-01T00:00:00Z",
      created_at: "2026-01-01T00:00:00Z",
      html_url: "https://github.com/u/app-a",
      description: "A",
    },
    {
      name: "app-b",
      full_name: "u/app-b",
      language: "Python",
      stargazers_count: 5,
      forks_count: 1,
      watchers_count: 5,
      open_issues_count: 0,
      size: 50,
      fork: true,
      archived: false,
      pushed_at: "2026-08-10T00:00:00Z",
      updated_at: "2026-08-10T00:00:00Z",
      created_at: "2026-02-01T00:00:00Z",
      html_url: "https://github.com/u/app-b",
      description: "B",
    },
    {
      name: "app-c",
      full_name: "u/app-c",
      language: "JavaScript",
      stargazers_count: 20,
      forks_count: 0,
      watchers_count: 20,
      open_issues_count: 3,
      size: 200,
      fork: false,
      archived: true,
      pushed_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-01T00:00:00Z",
      created_at: "2025-01-01T00:00:00Z",
      html_url: "https://github.com/u/app-c",
      description: null,
    },
  ];

  test("TC-U-USER-01 totaux stars forks issues", function () {
    var stats = aggregateRepos(sampleRepos);
    expect(stats.repoCount).toBe(3);
    expect(stats.totalStars).toBe(35);
    expect(stats.totalForks).toBe(3);
    expect(stats.totalOpenIssues).toBe(4);
    expect(stats.originalCount).toBe(2);
    expect(stats.forksCount).toBe(1);
    expect(stats.archivedCount).toBe(1);
  });

  test("TC-U-USER-02 langages par nombre de dépôts", function () {
    var stats = aggregateRepos(sampleRepos);
    var langs = stats.languagesByRepos.languages;
    var js = langs.find(function (l) {
      return l.name === "JavaScript";
    });
    expect(js.value).toBe(2);
    expect(stats.languagesByRepos.dominant.name).toBe("JavaScript");
  });

  test("TC-U-USER-03 topByStars ordonné", function () {
    var stats = aggregateRepos(sampleRepos);
    expect(stats.topByStars[0].name).toBe("app-c");
    expect(stats.topByStars[0].stargazers_count).toBe(20);
  });

  test("TC-U-USER-04 liste vide", function () {
    var stats = aggregateRepos([]);
    expect(stats.repoCount).toBe(0);
    expect(stats.totalStars).toBe(0);
    expect(stats.languagesByRepos.languageCount).toBe(0);
  });
});
