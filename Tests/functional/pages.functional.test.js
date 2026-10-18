/**
 * Tests fonctionnels : pages web (écrans)
 * Prérequis : next start + faux GitHub (npm run test:server)
 */

var http = require("../helpers/http");

beforeAll(http.requireServer);

describe("TF-PAGE : écrans de l'application", function () {
  test("TF-PAGE-01 l'accueil propose l'analyse", async function () {
    var page = await http.getHtml("/");
    expect(page.status).toBe(200);
    expect(page.html).toMatch(/GitHub Analytics|Analyser/i);
    // pas de fuite de placeholder type ghp_
    expect(page.html).not.toMatch(/ghp_/);
  });

  test("TF-PAGE-02 la page dépôt se charge", async function () {
    var page = await http.getHtml("/repo/" + http.PUBLIC_REPO_DOT);
    expect(page.status).toBe(200);
    expect(page.html).toMatch(/<html/i);
    expect(page.html.length).toBeGreaterThan(100);
  });

  test("TF-PAGE-03 la page compte se charge", async function () {
    var page = await http.getHtml("/user/" + http.PUBLIC_USER);
    expect(page.status).toBe(200);
    expect(page.html).toMatch(/<html/i);
    expect(page.html.length).toBeGreaterThan(100);
  });
});
