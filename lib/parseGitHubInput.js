import { validateGitHubName } from "./security";

// accepte :
// - un compte : "octocat" ou "https://github.com/octocat"
// - un dépôt  : "owner/repo" ou "https://github.com/owner/repo"
function parseGitHubInput(raw) {
  if (!raw || typeof raw !== "string") {
    return null;
  }

  var text = raw.trim();
  if (text === "") {
    return null;
  }

  text = text.replace(/\s+/g, " ").trim();
  var compact = text.replace(/\s+/g, "");

  if (compact.toLowerCase().endsWith(".git")) {
    compact = compact.slice(0, -4);
  }

  var q = compact.indexOf("?");
  if (q !== -1) {
    compact = compact.slice(0, q);
  }
  var h = compact.indexOf("#");
  if (h !== -1) {
    compact = compact.slice(0, h);
  }

  var lower = compact.toLowerCase();
  if (lower.indexOf("github.com/") !== -1) {
    var idx = lower.indexOf("github.com/");
    compact = compact.slice(idx + "github.com/".length);
  }

  while (compact.charAt(0) === "/") {
    compact = compact.slice(1);
  }
  while (compact.charAt(compact.length - 1) === "/") {
    compact = compact.slice(0, -1);
  }

  if (compact.indexOf("/") === -1 && text.indexOf(" ") !== -1) {
    compact = text.trim().replace(/\s+/g, "/");
  }

  var parts = compact.split("/").filter(function (p) {
    return p !== "";
  });

  if (parts.length === 0) {
    return null;
  }

  if (parts.length === 1) {
    var userCheck = validateGitHubName(parts[0], "nom d'utilisateur");
    if (!userCheck.ok) {
      return null;
    }
    return {
      type: "user",
      username: userCheck.value,
    };
  }

  var ownerCheck = validateGitHubName(parts[0], "propriétaire");
  var repoCheck = validateGitHubName(parts[1], "dépôt");
  if (!ownerCheck.ok || !repoCheck.ok) {
    return null;
  }

  return {
    type: "repo",
    owner: ownerCheck.value,
    repo: repoCheck.value,
  };
}

export { parseGitHubInput };
