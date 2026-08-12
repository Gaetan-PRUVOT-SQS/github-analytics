/**
 * Tests fonctionnels — saisie utilisateur (sans serveur)
 * Exigence : l'app doit accepter un compte OU un dépôt (URL ou raccourci)
 */

import { parseGitHubInput } from "../../lib/parseGitHubInput";

describe("TF-PARSE — saisie compte ou dépôt", function () {
  test("TF-PARSE-01 l'utilisateur saisit un pseudo → analyse de compte", function () {
    var result = parseGitHubInput("octocat");
    expect(result).not.toBeNull();
    expect(result.type).toBe("user");
    expect(result.username).toBe("octocat");
  });

  test("TF-PARSE-02 l'utilisateur colle l'URL d'un profil → compte", function () {
    var result = parseGitHubInput("https://github.com/octocat");
    expect(result.type).toBe("user");
    expect(result.username).toBe("octocat");
  });

  test("TF-PARSE-03 l'utilisateur saisit owner/repo → dépôt", function () {
    var result = parseGitHubInput("facebook/react");
    expect(result.type).toBe("repo");
    expect(result.owner).toBe("facebook");
    expect(result.repo).toBe("react");
  });

  test("TF-PARSE-04 l'utilisateur colle une URL de dépôt → dépôt", function () {
    var result = parseGitHubInput("https://github.com/vercel/next.js");
    expect(result.type).toBe("repo");
    expect(result.owner).toBe("vercel");
    expect(result.repo).toBe("next.js");
  });

  test("TF-PARSE-05 saisie invalide → refus", function () {
    expect(parseGitHubInput("")).toBeNull();
    expect(parseGitHubInput("!!!")).toBeNull();
    expect(parseGitHubInput("owner/repo!")).toBeNull();
  });

  test("TF-PARSE-06 URL avec .git toujours acceptée", function () {
    var result = parseGitHubInput("https://github.com/facebook/react.git");
    expect(result.type).toBe("repo");
    expect(result.repo).toBe("react");
  });
});
