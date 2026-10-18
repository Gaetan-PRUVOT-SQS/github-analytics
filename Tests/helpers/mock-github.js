// faux serveur de l'API GitHub, sur 127.0.0.1 uniquement
// rend les tests fonctionnels et système déterministes, sans réseau

var http = require("node:http");
var fixtures = require("../fixtures/github");

function send(res, status, body, headers) {
  var payload = body === null ? "" : JSON.stringify(body);
  var all = Object.assign(
    { "content-type": "application/json; charset=utf-8" },
    headers || {}
  );
  res.writeHead(status, all);
  res.end(payload);
}

function handle(req, res, log) {
  var url = new URL(req.url, "http://127.0.0.1");
  var path = url.pathname;
  log.push({ method: req.method, path: path, search: url.search });

  if (req.method !== "GET") {
    send(res, 405, { message: "Method Not Allowed" });
    return;
  }

  if (req.headers.authorization === "Bearer " + fixtures.INVALID_TOKEN) {
    send(res, 401, { message: "Bad credentials" });
    return;
  }

  if (path === fixtures.RATE_LIMITED) {
    send(res, 403, { message: "API rate limit exceeded" });
    return;
  }

  if (path === fixtures.REDIRECT_LOOP) {
    send(res, 301, { message: "Moved Permanently" }, {
      location: "https://api.github.com" + fixtures.REDIRECT_LOOP,
    });
    return;
  }

  if (Object.prototype.hasOwnProperty.call(fixtures.BAD_REDIRECTS, path)) {
    send(res, 302, { message: "Found" }, {
      location: fixtures.BAD_REDIRECTS[path],
    });
    return;
  }

  var prefix = fixtures.TRANSFERRED.prefix;
  if (path === prefix || path.indexOf(prefix + "/") === 0) {
    send(res, 301, { message: "Moved Permanently" }, {
      location: fixtures.TRANSFERRED.target + path.slice(prefix.length) + url.search,
    });
    return;
  }

  if (Object.prototype.hasOwnProperty.call(fixtures.ROUTES, path)) {
    send(res, 200, fixtures.ROUTES[path]);
    return;
  }

  send(res, 404, { message: "Not Found" });
}

// démarre le faux GitHub et résout avec son adresse et le journal des appels
function startMockGithub(port) {
  var log = [];
  var server = http.createServer(function (req, res) {
    handle(req, res, log);
  });
  return new Promise(function (resolve, reject) {
    server.once("error", reject);
    server.listen(port || 0, "127.0.0.1", function () {
      var address = server.address();
      resolve({
        url: "http://127.0.0.1:" + address.port,
        log: log,
        close: function () {
          return new Promise(function (done) {
            server.close(function () {
              done();
            });
            server.closeAllConnections();
          });
        },
      });
    });
  });
}

module.exports = { startMockGithub };
