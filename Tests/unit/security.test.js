/**
 * Tests sécurité — validation des entrées
 * Module : lib/security.js
 */

import {
  validateGitHubName,
  validateRepoParams,
  validateUsername,
  sanitizeToken,
  isSafeGithubApiPath,
} from "../../lib/security";

describe("TC-U-SEC — validateGitHubName", function () {
  test("TC-U-SEC-01 nom valide", function () {
    var result = validateGitHubName("octocat", "user");
    expect(result.ok).toBe(true);
    expect(result.value).toBe("octocat");
  });

  test("TC-U-SEC-02 path traversal rejeté", function () {
    expect(validateGitHubName("../etc", "user").ok).toBe(false);
    expect(validateGitHubName("foo/bar", "user").ok).toBe(false);
    expect(validateGitHubName("..", "user").ok).toBe(false);
  });

  test("TC-U-SEC-03 caractères interdits", function () {
    expect(validateGitHubName("a b", "user").ok).toBe(false);
    expect(validateGitHubName("a@b", "user").ok).toBe(false);
    expect(validateGitHubName("", "user").ok).toBe(false);
  });

  test("TC-U-SEC-04 trop long", function () {
    var longName = "a".repeat(200);
    expect(validateGitHubName(longName, "user").ok).toBe(false);
  });
});

describe("TC-U-SEC — validateRepoParams / username", function () {
  test("TC-U-SEC-05 repo valide", function () {
    var result = validateRepoParams("vercel", "next.js");
    expect(result.ok).toBe(true);
    expect(result.owner).toBe("vercel");
    expect(result.repo).toBe("next.js");
  });

  test("TC-U-SEC-06 username valide", function () {
    var result = validateUsername("octocat");
    expect(result.ok).toBe(true);
    expect(result.username).toBe("octocat");
  });
});

describe("TC-U-SEC — sanitizeToken", function () {
  test("TC-U-SEC-07 token simple accepté", function () {
    expect(sanitizeToken("ghp_abcdefghijklmnopqrstuvwxyz0123456789")).toBeTruthy();
  });

  test("TC-U-SEC-08 token avec retour ligne rejeté", function () {
    expect(sanitizeToken("ghp_abc\ninjected")).toBeNull();
  });

  test("TC-U-SEC-09 token vide / null", function () {
    expect(sanitizeToken("")).toBeNull();
    expect(sanitizeToken(null)).toBeNull();
    expect(sanitizeToken("   ")).toBeNull();
  });
});

describe("TC-U-SEC — isSafeGithubApiPath", function () {
  test("TC-U-SEC-10 chemins relatifs ok", function () {
    expect(isSafeGithubApiPath("/repos/vercel/next.js")).toBe(true);
    expect(isSafeGithubApiPath("/users/octocat")).toBe(true);
  });

  test("TC-U-SEC-11 SSRF / traversal rejetés", function () {
    expect(isSafeGithubApiPath("https://evil.com")).toBe(false);
    expect(isSafeGithubApiPath("/repos/../admin")).toBe(false);
    expect(isSafeGithubApiPath("//evil.com")).toBe(false);
    expect(isSafeGithubApiPath("repos/no-slash")).toBe(false);
  });
});
