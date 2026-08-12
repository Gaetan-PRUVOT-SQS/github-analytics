/**
 * Tests fonctionnels — pages web (écrans)
 * Prérequis : serveur Next (npm run dev)
 */

var http = require("../helpers/http");

var canRun = false;

beforeAll(async function () {
  canRun = await http.serverUp();
  if (!canRun) {
    console.warn(
      "[TF-PAGE] Serveur absent sur " +
        http.BASE +
        " — scénarios skip. Lance npm run dev."
    );
  }
});

describe("TF-PAGE — écrans de l'application", function () {
  test("TF-PAGE-01 l'accueil propose l'analyse", async function () {
    if (!canRun) {
      return;
    }
    var page = await http.getHtml("/");
    expect(page.status).toBe(200);
    expect(page.html).toMatch(/GitHub Analytics|Analyser/i);
    // pas de fuite de placeholder type ghp_
    expect(page.html).not.toMatch(/ghp_/);
  });

  test("TF-PAGE-02 la page dépôt se charge", async function () {
    if (!canRun) {
      return;
    }
    var page = await http.getHtml("/repo/" + http.PUBLIC_REPO_DOT);
    expect(page.status).toBe(200);
    expect(page.html.length).toBeGreaterThan(100);
  });

  test("TF-PAGE-03 la page compte se charge", async function () {
    if (!canRun) {
      return;
    }
    var page = await http.getHtml("/user/" + http.PUBLIC_USER);
    expect(page.status).toBe(200);
    expect(page.html.length).toBeGreaterThan(100);
  });
});
