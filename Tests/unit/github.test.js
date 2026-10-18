/**
 * Unitaire / Partitions + valeurs limites + devinette d'erreur (SSRF)
 * Module : lib/github.js (githubFetch, redirections, base de l'API)
 * Condition : fetch remplacé par un faux, aucun appel réseau
 */

import {
  githubFetch,
  getApiBase,
  getTokenFromRequest,
  jsonError,
  jsonOk,
  MAX_REDIRECTS,
} from "../../lib/github";

var TOKEN = "ghp_faketoken000000000000000000000000000";
var savedFetch = global.fetch;
var savedBase = process.env.GITHUB_API_BASE;
var savedToken = process.env.GITHUB_TOKEN;

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { "content-type": "application/json" },
  });
}

function redirectResponse(status, location) {
  var headers = {};
  if (location !== null) {
    headers.location = location;
  }
  return new Response(null, { status: status, headers: headers });
}

// faux fetch qui rejoue une liste de réponses et garde chaque appel
function fakeFetch(responses) {
  var calls = [];
  var fn = async function (url, options) {
    calls.push({ url: url, options: options });
    var next = responses[calls.length - 1];
    if (next instanceof Error) {
      throw next;
    }
    if (!next) {
      throw new Error("appel inattendu : " + url);
    }
    return next;
  };
  global.fetch = fn;
  return calls;
}

beforeEach(function () {
  delete process.env.GITHUB_API_BASE;
  delete process.env.GITHUB_TOKEN;
});

afterEach(function () {
  global.fetch = savedFetch;
  if (savedBase === undefined) {
    delete process.env.GITHUB_API_BASE;
  } else {
    process.env.GITHUB_API_BASE = savedBase;
  }
  if (savedToken === undefined) {
    delete process.env.GITHUB_TOKEN;
  } else {
    process.env.GITHUB_TOKEN = savedToken;
  }
});

describe("TC-U-GH : appel direct", function () {
  test("TC-U-GH-01 réponse 200 sans redirection", async function () {
    var calls = fakeFetch([jsonResponse(200, { full_name: "vercel/next.js" })]);
    var result = await githubFetch("/repos/vercel/next.js", TOKEN);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data.full_name).toBe("vercel/next.js");
    expect(calls.length).toBe(1);
    expect(calls[0].url).toBe("https://api.github.com/repos/vercel/next.js");
    expect(calls[0].options.redirect).toBe("manual");
    expect(calls[0].options.headers.Authorization).toBe("Bearer " + TOKEN);
  });

  test("TC-U-GH-02 chemin dangereux refusé sans appel réseau", async function () {
    var calls = fakeFetch([]);
    var result = await githubFetch("https://evil.example/x", TOKEN);
    expect(result.status).toBe(400);
    expect(result.errorCode).toBe("bad_request");
    expect(calls.length).toBe(0);
  });
});

describe("TC-U-GH : dépôt transféré (redirections)", function () {
  test("TC-U-GH-03 redirection 301 suivie vers api.github.com", async function () {
    var calls = fakeFetch([
      redirectResponse(301, "https://api.github.com/repositories/10270250"),
      jsonResponse(200, { full_name: "react/react" }),
    ]);
    var result = await githubFetch("/repos/facebook/react", TOKEN);
    expect(result.ok).toBe(true);
    expect(result.data.full_name).toBe("react/react");
    expect(calls.length).toBe(2);
    expect(calls[1].url).toBe("https://api.github.com/repositories/10270250");
    expect(calls[1].options.headers.Authorization).toBe("Bearer " + TOKEN);
  });

  test("TC-U-GH-04 les codes 302, 307 et 308 sont suivis aussi", async function () {
    var codes = [302, 307, 308];
    var i;
    for (i = 0; i < codes.length; i++) {
      var calls = fakeFetch([
        redirectResponse(codes[i], "https://api.github.com/repositories/1/languages"),
        jsonResponse(200, { JavaScript: 10 }),
      ]);
      var result = await githubFetch("/repos/a/b/languages", null);
      expect(result.ok).toBe(true);
      expect(calls[1].url).toBe("https://api.github.com/repositories/1/languages");
    }
  });

  test("TC-U-GH-05 Location relative résolue sur api.github.com", async function () {
    var calls = fakeFetch([
      redirectResponse(301, "/repositories/10270250/commits?per_page=100"),
      jsonResponse(200, []),
    ]);
    var result = await githubFetch("/repos/facebook/react/commits?per_page=100", null);
    expect(result.ok).toBe(true);
    expect(calls[1].url).toBe(
      "https://api.github.com/repositories/10270250/commits?per_page=100"
    );
  });

  test("TC-U-GH-06 limite : 3 redirections acceptées", async function () {
    expect(MAX_REDIRECTS).toBe(3);
    var calls = fakeFetch([
      redirectResponse(301, "https://api.github.com/repositories/1"),
      redirectResponse(301, "https://api.github.com/repositories/2"),
      redirectResponse(301, "https://api.github.com/repositories/3"),
      jsonResponse(200, { id: 3 }),
    ]);
    var result = await githubFetch("/repos/a/b", TOKEN);
    expect(result.ok).toBe(true);
    expect(result.data.id).toBe(3);
    expect(calls.length).toBe(4);
  });

  test("TC-U-GH-07 limite : 4 redirections refusées (boucle)", async function () {
    var calls = fakeFetch([
      redirectResponse(301, "https://api.github.com/repositories/1"),
      redirectResponse(301, "https://api.github.com/repositories/2"),
      redirectResponse(301, "https://api.github.com/repositories/3"),
      redirectResponse(301, "https://api.github.com/repositories/4"),
    ]);
    var result = await githubFetch("/repos/a/b", TOKEN);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(502);
    expect(result.errorCode).toBe("too_many_redirects");
    expect(calls.length).toBe(4);
  });
});

describe("TC-U-GH : redirections refusées (anti-SSRF)", function () {
  var refused = [
    ["hôte étranger", "https://evil.example/repos/a/b"],
    ["sous-domaine piège", "https://api.github.com.evil.example/repos/a/b"],
    ["autre hôte GitHub", "https://github.com/a/b"],
    ["port explicite", "https://api.github.com:8443/repos/a/b"],
    ["identifiants dans l'URL", "https://user:pass@api.github.com/repos/a/b"],
    ["rétrogradation http", "http://api.github.com/repos/a/b"],
    ["autre protocole", "file:///etc/passwd"],
    ["URL réseau relative", "//evil.example/repos/a/b"],
    ["chemin non sûr (double barre)", "https://api.github.com/repos//a"],
    ["chemin non sûr (arobase)", "https://api.github.com/repos/a@b/c"],
    ["URL illisible", "https://[api.github.com/repos/a/b"],
    ["Location vide", ""],
    ["Location absente", null],
  ];

  test.each(refused)(
    "TC-U-GH-08 %s : refus 502 sans suivre ni envoyer le token",
    async function (label, location) {
      var calls = fakeFetch([
        redirectResponse(301, location),
        jsonResponse(200, { leaked: true }),
      ]);
      var result = await githubFetch("/repos/a/b", TOKEN);
      expect(result.ok).toBe(false);
      expect(result.status).toBe(502);
      expect(result.errorCode).toBe("bad_redirect");
      expect(result.data).toBeNull();
      expect(calls.length).toBe(1);
      expect(calls[0].url).toBe("https://api.github.com/repos/a/b");
    }
  );

  test("TC-U-GH-09 refus au 2e saut : chaque saut est revalidé", async function () {
    var calls = fakeFetch([
      redirectResponse(301, "https://api.github.com/repositories/1"),
      redirectResponse(302, "https://evil.example/steal"),
      jsonResponse(200, { leaked: true }),
    ]);
    var result = await githubFetch("/repos/a/b", TOKEN);
    expect(result.status).toBe(502);
    expect(result.errorCode).toBe("bad_redirect");
    expect(calls.length).toBe(2);
    var i;
    for (i = 0; i < calls.length; i++) {
      expect(calls[i].url.indexOf("https://api.github.com/")).toBe(0);
    }
  });
});

describe("TC-U-GH : erreurs amont", function () {
  test("TC-U-GH-10 erreur réseau : 502 et pas 500", async function () {
    fakeFetch([new TypeError("fetch failed")]);
    var result = await githubFetch("/repos/a/b", null);
    expect(result.status).toBe(502);
    expect(result.errorCode).toBe("network");
  });

  test("TC-U-GH-11 panne GitHub 503 : 502", async function () {
    fakeFetch([jsonResponse(503, { message: "unavailable" })]);
    var result = await githubFetch("/repos/a/b", null);
    expect(result.status).toBe(502);
    expect(result.errorCode).toBe("api_error");
  });

  test("TC-U-GH-12 corps non JSON : 502", async function () {
    fakeFetch([new Response("<html>", { status: 200 })]);
    var result = await githubFetch("/repos/a/b", null);
    expect(result.status).toBe(502);
    expect(result.errorCode).toBe("bad_response");
  });

  test("TC-U-GH-13 404, 401, 403 et 429 gardent leur sens", async function () {
    var cases = [
      [404, "not_found"],
      [401, "unauthorized"],
      [403, "rate_limit"],
      [429, "rate_limit"],
      [422, "api_error"],
    ];
    var i;
    for (i = 0; i < cases.length; i++) {
      fakeFetch([jsonResponse(cases[i][0], {})]);
      var result = await githubFetch("/repos/a/b", null);
      expect(result.status).toBe(cases[i][0]);
      expect(result.errorCode).toBe(cases[i][1]);
    }
  });
});

describe("TC-U-GH : base de l'API (GITHUB_API_BASE)", function () {
  test("TC-U-GH-14 sans variable : api.github.com", function () {
    expect(getApiBase()).toBe("https://api.github.com");
    process.env.GITHUB_API_BASE = "";
    expect(getApiBase()).toBe("https://api.github.com");
  });

  test("TC-U-GH-15 seul 127.0.0.1 en http est accepté en plus", function () {
    process.env.GITHUB_API_BASE = "http://127.0.0.1:4010";
    expect(getApiBase()).toBe("http://127.0.0.1:4010");
    var invalid = [
      "http://evil.example",
      "https://evil.example",
      "http://localhost:4010",
      "http://127.0.0.1.evil.example:80",
      "http://127.0.0.1:4010/",
      "http://127.0.0.1:4010/repos",
      "http://user@127.0.0.1:4010",
      "http://0.0.0.0:4010",
    ];
    var i;
    for (i = 0; i < invalid.length; i++) {
      process.env.GITHUB_API_BASE = invalid[i];
      expect(getApiBase()).toBeNull();
    }
  });

  test("TC-U-GH-16 base invalide : refus sans aucun appel", async function () {
    process.env.GITHUB_API_BASE = "http://evil.example";
    var calls = fakeFetch([]);
    var result = await githubFetch("/repos/a/b", TOKEN);
    expect(result.status).toBe(500);
    expect(result.errorCode).toBe("config_error");
    expect(calls.length).toBe(0);
  });

  test("TC-U-GH-17 base locale : la redirection reste validée sur api.github.com", async function () {
    process.env.GITHUB_API_BASE = "http://127.0.0.1:4010";
    var calls = fakeFetch([
      redirectResponse(301, "https://api.github.com/repositories/10270250"),
      jsonResponse(200, { full_name: "react/react" }),
    ]);
    var result = await githubFetch("/repos/facebook/react", null);
    expect(result.ok).toBe(true);
    expect(calls[0].url).toBe("http://127.0.0.1:4010/repos/facebook/react");
    expect(calls[1].url).toBe("http://127.0.0.1:4010/repositories/10270250");
  });
});

describe("TC-U-GH : token et réponses JSON", function () {
  function request(headerToken) {
    var headers = new Headers();
    if (headerToken !== null) {
      headers.set("x-github-token", headerToken);
    }
    return new Request("http://127.0.0.1/api/repo/a/b", { headers: headers });
  }

  test("TC-U-GH-18 token de l'en-tête prioritaire sur celui du serveur", function () {
    process.env.GITHUB_TOKEN = "ghp_servertoken";
    expect(getTokenFromRequest(request("ghp_headertoken"))).toBe("ghp_headertoken");
  });

  test("TC-U-GH-19 en-tête absent ou invalide : token du serveur", function () {
    process.env.GITHUB_TOKEN = "ghp_servertoken";
    expect(getTokenFromRequest(request(null))).toBe("ghp_servertoken");
    expect(getTokenFromRequest(request("bad token!"))).toBe("ghp_servertoken");
  });

  test("TC-U-GH-20 aucun token valide : null", function () {
    expect(getTokenFromRequest(request(null))).toBeNull();
    process.env.GITHUB_TOKEN = "bad token!";
    expect(getTokenFromRequest(request(null))).toBeNull();
  });

  test("TC-U-GH-21 jsonError garde le statut, 500 si absent", async function () {
    var res = jsonError({ status: 502, errorCode: "network", message: "x" });
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "network", message: "x" });
    expect(jsonError({ status: 0, errorCode: "e", message: "m" }).status).toBe(500);
  });

  test("TC-U-GH-22 jsonOk renvoie 200 et le corps JSON", async function () {
    var res = jsonOk({ a: 1 });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ a: 1 });
  });
});
