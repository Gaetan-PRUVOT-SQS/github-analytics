/**
 * Unitaire — partitions d'équivalence + table de décision
 * Module : lib/parseGitHubInput.js
 */

import { parseGitHubInput } from "../../lib/parseGitHubInput";

describe("TC-U-PARSE — parseGitHubInput", function () {
  test("TC-U-PARSE-01 username seul → type user", function () {
    var result = parseGitHubInput("octocat");
    expect(result).toEqual({
      type: "user",
      username: "octocat",
    });
  });

  test("TC-U-PARSE-02 URL profil → type user", function () {
    var result = parseGitHubInput("https://github.com/octocat");
    expect(result).toEqual({
      type: "user",
      username: "octocat",
    });
  });

  test("TC-U-PARSE-03 URL profil avec slash final → type user", function () {
    var result = parseGitHubInput("https://github.com/octocat/");
    expect(result).toEqual({ type: "user", username: "octocat" });
  });

  test("TC-U-PARSE-04 owner/repo → type repo", function () {
    var result = parseGitHubInput("vercel/next.js");
    expect(result).toEqual({
      type: "repo",
      owner: "vercel",
      repo: "next.js",
    });
  });

  test("TC-U-PARSE-05 URL dépôt complète → type repo", function () {
    var result = parseGitHubInput("https://github.com/facebook/react");
    expect(result).toEqual({
      type: "repo",
      owner: "facebook",
      repo: "react",
    });
  });

  test("TC-U-PARSE-06 URL avec .git → type repo", function () {
    var result = parseGitHubInput("https://github.com/facebook/react.git");
    expect(result).toEqual({
      type: "repo",
      owner: "facebook",
      repo: "react",
    });
  });

  test("TC-U-PARSE-07 github.com sans protocole → type repo", function () {
    var result = parseGitHubInput("github.com/owner/repo");
    expect(result).toEqual({
      type: "repo",
      owner: "owner",
      repo: "repo",
    });
  });

  test("TC-U-PARSE-08 espaces / retours ligne collés", function () {
    var result = parseGitHubInput("  vercel/next.js  \n");
    expect(result.type).toBe("repo");
    expect(result.owner).toBe("vercel");
  });

  test("TC-U-PARSE-09 ignore query et hash", function () {
    var result = parseGitHubInput(
      "https://github.com/owner/repo?tab=readme#license"
    );
    expect(result).toEqual({
      type: "repo",
      owner: "owner",
      repo: "repo",
    });
  });

  test("TC-U-PARSE-10 chaîne vide → null", function () {
    expect(parseGitHubInput("")).toBeNull();
    expect(parseGitHubInput("   ")).toBeNull();
  });

  test("TC-U-PARSE-11 null / non string → null", function () {
    expect(parseGitHubInput(null)).toBeNull();
    expect(parseGitHubInput(undefined)).toBeNull();
    expect(parseGitHubInput(123)).toBeNull();
  });

  test("TC-U-PARSE-12 caractères invalides → null", function () {
    expect(parseGitHubInput("owner/repo!")).toBeNull();
    expect(parseGitHubInput("bad@user")).toBeNull();
    expect(parseGitHubInput("!!!")).toBeNull();
  });

  test("TC-U-PARSE-13 owner repo avec espace → type repo", function () {
    var result = parseGitHubInput("vercel next.js");
    expect(result).toEqual({
      type: "repo",
      owner: "vercel",
      repo: "next.js",
    });
  });
});
