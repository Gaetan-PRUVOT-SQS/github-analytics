/**
 * Tests fonctionnels : cas d'erreur visibles par l'utilisateur
 * Prérequis : next start + faux GitHub (npm run test:server)
 */

var http = require("../helpers/http");

beforeAll(http.requireServer);

describe("TF-ERR : erreurs fonctionnelles", function () {
  test("TF-ERR-01 dépôt inexistant : message clair en français", async function () {
    var result = await http.getJson("/api/repo/zzz-no-owner/zzz-no-repo");
    expect(result.status).toBe(404);
    expect(result.data.error).toBe("not_found");
    expect(result.data.message.toLowerCase()).toMatch(/introuvable/);
  });

  test("TF-ERR-02 utilisateur inexistant : message clair", async function () {
    var result = await http.getJson(
      "/api/user/zzz-no-user-does-not-exist-xyz-12345"
    );
    expect(result.status).toBe(404);
    expect(result.data.error).toBe("not_found");
    expect(result.data.message.toLowerCase()).toMatch(/introuvable/);
  });

  test("TF-ERR-03 paramètres invalides : 400", async function () {
    var result = await http.getJson("/api/repo/bad@owner/bad@repo");
    expect(result.status).toBe(400);
    expect(result.data.error).toBe("bad_request");
  });

  test("TF-ERR-04 token invalide : 401 avec message FR", async function () {
    var result = await http.getJson(
      "/api/repo/" + http.PUBLIC_REPO,
      http.INVALID_TOKEN
    );
    expect(result.status).toBe(401);
    expect(result.data.error).toBe("unauthorized");
    expect(result.data.message.toLowerCase()).toMatch(/token/);
  });

  test("TF-ERR-05 limite API GitHub : 403 et conseil d'ajouter un token", async function () {
    var result = await http.getJson("/api/repo/rate/limited");
    expect(result.status).toBe(403);
    expect(result.data.error).toBe("rate_limit");
    expect(result.data.message.toLowerCase()).toMatch(/token/);
  });

  test("TF-ERR-06 redirection vers un autre hôte : refus 502", async function () {
    var result = await http.getJson("/api/repo/evil/redirect");
    expect(result.status).toBe(502);
    expect(result.data.error).toBe("bad_redirect");
  });

  test("TF-ERR-07 redirection en http : refus 502", async function () {
    var result = await http.getJson("/api/repo/evil/downgrade");
    expect(result.status).toBe(502);
    expect(result.data.error).toBe("bad_redirect");
  });

  test("TF-ERR-08 boucle de redirections : arrêt en 502", async function () {
    var result = await http.getJson("/api/repo/loop/forever");
    expect(result.status).toBe(502);
    expect(result.data.error).toBe("too_many_redirects");
  });
});
