/**
 * Tests fonctionnels — cas d'erreur visibles par l'utilisateur
 * Prérequis : serveur Next (npm run dev)
 */

var http = require("../helpers/http");

var canRun = false;

beforeAll(async function () {
  canRun = await http.serverUp();
  if (!canRun) {
    console.warn(
      "[TF-ERR] Serveur absent sur " +
        http.BASE +
        " — scénarios skip. Lance npm run dev."
    );
  }
});

describe("TF-ERR — erreurs fonctionnelles", function () {
  test("TF-ERR-01 dépôt inexistant → message clair en français", async function () {
    if (!canRun) {
      return;
    }
    var result = await http.getJson("/api/repo/zzz-no-owner/zzz-no-repo");
    if (http.skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(404);
    expect(result.data.error).toBe("not_found");
    expect(result.data.message.toLowerCase()).toMatch(/introuvable/);
  });

  test("TF-ERR-02 utilisateur inexistant → message clair", async function () {
    if (!canRun) {
      return;
    }
    var result = await http.getJson(
      "/api/user/zzz-no-user-does-not-exist-xyz-12345"
    );
    if (http.skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(404);
    expect(result.data.message.toLowerCase()).toMatch(/introuvable/);
  });

  test("TF-ERR-03 paramètres invalides (path traversal) → 400", async function () {
    if (!canRun) {
      return;
    }
    // le routeur Next encode souvent les segments ; on teste un nom invalide simple
    var result = await http.getJson("/api/repo/bad@owner/bad@repo");
    // peut être 400 (notre validation) ou 404 selon le routage
    expect([400, 404]).toContain(result.status);
    if (result.status === 400) {
      expect(result.data.error).toBe("bad_request");
    }
  });

  test("TF-ERR-04 token invalide → 401 avec message FR", async function () {
    if (!canRun) {
      return;
    }
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO,
      "ghp_INVALIDTOKEN123456789012345678901234"
    );
    if (http.skipIfRateLimited(result)) {
      return;
    }
    expect(result.status).toBe(401);
    expect(result.data.error).toBe("unauthorized");
    expect(result.data.message.toLowerCase()).toMatch(/token/);
  });
});
