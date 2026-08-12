/**
 * Unitaire / Valeurs limites + partitions
 * Module : lib/stats.js
 */

import {
  languagesToPercent,
  isDocumentationOnly,
  markLanguageAnalysis,
  filterIssuesOnly,
  analyzeCommits,
  enrichContributors,
  formatBytes,
  formatAge,
  repoAgeDays,
} from "../../lib/stats";

var { sumPercents, namesOf } = require("../helpers/assert");

describe("TC-U-STATS — languagesToPercent", function () {
  test("TC-U-STATS-01 objet vide → liste vide", function () {
    var result = languagesToPercent({});
    expect(result.languageCount).toBe(0);
    expect(result.languages).toEqual([]);
    expect(result.dominant).toBeNull();
  });

  test("TC-U-STATS-02 un seul langage → 100 %", function () {
    var result = languagesToPercent({ JavaScript: 1000 });
    expect(result.languageCount).toBe(1);
    expect(result.languages[0].name).toBe("JavaScript");
    expect(result.languages[0].percent).toBe(100);
    expect(sumPercents(result.languages)).toBeCloseTo(100, 1);
  });

  test("TC-U-STATS-03 multi-langages → somme des % = 100", function () {
    var result = languagesToPercent({
      JavaScript: 50,
      TypeScript: 30,
      CSS: 20,
    });
    expect(result.languageCount).toBe(3);
    expect(sumPercents(result.languages)).toBeCloseTo(100, 1);
    expect(result.dominant.name).toBe("JavaScript");
    expect(namesOf(result.languages)).toEqual([
      "JavaScript",
      "TypeScript",
      "CSS",
    ]);
  });

  test("TC-U-STATS-04 très petit langage a un percentLabel", function () {
    var result = languagesToPercent({
      JavaScript: 99999,
      Pug: 1,
    });
    var pug = result.languages.find(function (l) {
      return l.name === "Pug";
    });
    expect(pug).toBeTruthy();
    expect(pug.percentLabel).toBeTruthy();
    expect(sumPercents(result.languages)).toBeCloseTo(100, 1);
  });
});

describe("TC-U-STATS — isDocumentationOnly / markLanguageAnalysis", function () {
  test("TC-U-STATS-05 Markdown seul → documentationOnly", function () {
    var analysis = languagesToPercent({ Markdown: 1300 });
    analysis.detected = true;
    markLanguageAnalysis(analysis);
    expect(isDocumentationOnly(analysis.languages)).toBe(true);
    expect(analysis.documentationOnly).toBe(true);
    expect(analysis.infoMessage).toMatch(/documentation|README/i);
  });

  test("TC-U-STATS-06 JS + Markdown → pas documentationOnly", function () {
    var analysis = languagesToPercent({
      JavaScript: 900,
      Markdown: 100,
    });
    markLanguageAnalysis(analysis);
    expect(analysis.documentationOnly).toBe(false);
  });
});

describe("TC-U-STATS — filterIssuesOnly", function () {
  test("TC-U-STATS-07 exclut les pull requests de la liste issues", function () {
    var items = [
      { number: 1, title: "bug", pull_request: { url: "x" } },
      { number: 2, title: "vrai issue" },
    ];
    var only = filterIssuesOnly(items);
    expect(only.length).toBe(1);
    expect(only[0].number).toBe(2);
  });
});

describe("TC-U-STATS — analyzeCommits", function () {
  test("TC-U-STATS-08 agrège timeline et weekdays", function () {
    var commits = [
      {
        commit: { author: { date: "2026-08-11T10:00:00Z", name: "A" } },
        author: { login: "alice" },
      },
      {
        commit: { author: { date: "2026-08-11T12:00:00Z", name: "A" } },
        author: { login: "alice" },
      },
      {
        commit: { author: { date: "2026-08-12T09:00:00Z", name: "B" } },
        author: { login: "bob" },
      },
    ];
    // ajoute messages
    commits[0].commit.message = "fix: a";
    commits[1].commit.message = "feat: b";
    commits[2].commit.message = "docs: c";

    var result = analyzeCommits(commits);
    expect(result.total).toBe(3);
    expect(result.byWeekday.length).toBe(7);
    expect(result.byHour.length).toBe(24);
    expect(result.authorCount).toBe(2);
    expect(result.timeline.length).toBeGreaterThanOrEqual(1);
    expect(result.topAuthors[0].login).toBe("alice");
  });

  test("TC-U-STATS-09 liste commits vide", function () {
    var result = analyzeCommits([]);
    expect(result.total).toBe(0);
    expect(result.timeline).toEqual([]);
  });
});

describe("TC-U-STATS — enrichContributors", function () {
  test("TC-U-STATS-10 pourcentages contributeurs", function () {
    var result = enrichContributors([
      {
        login: "a",
        avatar_url: "x",
        html_url: "x",
        contributions: 80,
      },
      {
        login: "b",
        avatar_url: "x",
        html_url: "x",
        contributions: 20,
      },
    ]);
    expect(result.contributorCount).toBe(2);
    expect(result.totalContributions).toBe(100);
    expect(result.contributors[0].percent).toBe(80);
    expect(result.topContributor.login).toBe("a");
  });
});

describe("TC-U-STATS — formatters", function () {
  test("TC-U-STATS-11 formatBytes", function () {
    expect(formatBytes(500)).toBe("500 o");
    expect(formatBytes(2048)).toMatch(/Ko/);
  });

  test("TC-U-STATS-12 formatAge / repoAgeDays", function () {
    expect(formatAge(10)).toMatch(/jours/);
    expect(formatAge(null)).toBe("—");
    var days = repoAgeDays("2020-01-01T00:00:00Z");
    expect(days).toBeGreaterThan(100);
  });
});
