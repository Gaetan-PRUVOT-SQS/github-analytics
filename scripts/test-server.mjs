// lance les tests fonctionnels et système contre un vrai `next start`
// sur 127.0.0.1, branché sur un faux GitHub local (aucun appel réseau)
//
// usage : npm run build && npm run test:server [-- dossiers jest]
// code retour : celui de jest, ou 1 si le serveur ne démarre pas

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";

const require = createRequire(import.meta.url);
const { startMockGithub } = require("../Tests/helpers/mock-github.js");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const HOST = "127.0.0.1";
const READY_TIMEOUT_MS = 60000;
const STOP_TIMEOUT_MS = 10000;
const DEFAULT_SUITES = ["Tests/functional", "Tests/system"];

function die(message) {
  console.error("[test-server] " + message);
  process.exit(1);
}

// demande un port libre au système
function freePort() {
  return new Promise(function (resolve, reject) {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, HOST, function () {
      const port = probe.address().port;
      probe.close(function () {
        resolve(port);
      });
    });
  });
}

// attend la ligne "Ready" de next start, échoue sur sortie ou délai dépassé
function waitForReady(child) {
  return new Promise(function (resolve, reject) {
    let output = "";
    let ready = false;
    const timer = setTimeout(function () {
      reject(new Error("next start pas prêt après " + READY_TIMEOUT_MS + " ms\n" + output));
    }, READY_TIMEOUT_MS);

    function onData(chunk) {
      const text = chunk.toString();
      process.stdout.write("[next] " + text);
      if (ready) {
        return;
      }
      output = output + text;
      if (/Ready in/.test(output)) {
        ready = true;
        clearTimeout(timer);
        resolve();
      }
    }

    child.stdout.on("data", onData);
    child.stderr.on("data", function (chunk) {
      process.stderr.write("[next] " + chunk.toString());
    });
    child.once("exit", function (code) {
      clearTimeout(timer);
      reject(new Error("next start s'est arrêté (code " + code + ")\n" + output));
    });
  });
}

// arrête tout le groupe de processus de next, SIGKILL si besoin
function stop(child) {
  return new Promise(function (resolve) {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }
    const timer = setTimeout(function () {
      process.kill(-child.pid, "SIGKILL");
    }, STOP_TIMEOUT_MS);
    child.once("exit", function () {
      clearTimeout(timer);
      resolve();
    });
    process.kill(-child.pid, "SIGTERM");
  });
}

function runJest(baseUrl, suites) {
  return new Promise(function (resolve) {
    const jestBin = path.join(ROOT, "node_modules", "jest", "bin", "jest.js");
    const child = spawn(process.execPath, [jestBin, "--ci"].concat(suites), {
      cwd: ROOT,
      stdio: "inherit",
      env: Object.assign({}, process.env, { BASE_URL: baseUrl }),
    });
    child.once("exit", function (code, signal) {
      resolve(code === null ? 1 : code);
      if (signal) {
        console.error("[test-server] jest arrêté par " + signal);
      }
    });
  });
}

async function main() {
  if (!existsSync(path.join(ROOT, ".next", "BUILD_ID"))) {
    die("aucune build trouvée : lance d'abord npm run build");
  }

  const suites = process.argv.slice(2);
  const mock = await startMockGithub(0);
  const port = await freePort();
  const baseUrl = "http://" + HOST + ":" + port;
  const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");

  // GITHUB_TOKEN vidé : aucun vrai token ne part, même vers le faux GitHub
  const env = Object.assign({}, process.env, {
    GITHUB_API_BASE: mock.url,
    GITHUB_TOKEN: "",
    NEXT_TELEMETRY_DISABLED: "1",
    TZ: "UTC",
  });

  const next = spawn(process.execPath, [nextBin, "start", "-H", HOST, "-p", String(port)], {
    cwd: ROOT,
    env: env,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let code = 1;
  try {
    await waitForReady(next);
    console.log("[test-server] next start prêt sur " + baseUrl + ", faux GitHub sur " + mock.url);
    code = await runJest(baseUrl, suites.length > 0 ? suites : DEFAULT_SUITES);
  } catch (error) {
    console.error("[test-server] " + error.message);
    code = 1;
  } finally {
    await stop(next);
    await mock.close();
  }

  console.log("[test-server] appels reçus par le faux GitHub : " + mock.log.length);
  process.exit(code);
}

main().catch(function (error) {
  die(error.stack || String(error));
});
