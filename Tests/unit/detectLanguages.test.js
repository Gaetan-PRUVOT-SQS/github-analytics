/**
 * Unitaire / Error guessing + partitions
 * Module : lib/detectLanguages.js
 */

import {
  languageFromPath,
  countLanguagesFromTree,
  isIgnoredPath,
} from "../../lib/detectLanguages";

describe("TC-U-DETECT — languageFromPath", function () {
  test("TC-U-DETECT-01 extensions code courantes", function () {
    expect(languageFromPath("src/app.js")).toBe("JavaScript");
    expect(languageFromPath("Main.kt")).toBe("Kotlin");
    expect(languageFromPath("script.py")).toBe("Python");
    expect(languageFromPath("lib/mod.rs")).toBe("Rust");
  });

  test("TC-U-DETECT-02 markdown et dockerfile", function () {
    expect(languageFromPath("README.md")).toBe("Markdown");
    expect(languageFromPath("Dockerfile")).toBe("Dockerfile");
  });

  test("TC-U-DETECT-03 extension inconnue → null", function () {
    expect(languageFromPath("photo.png")).toBeNull();
    expect(languageFromPath("README")).toBeNull();
  });
});

describe("TC-U-DETECT — isIgnoredPath", function () {
  test("TC-U-DETECT-04 ignore node_modules et dist", function () {
    expect(isIgnoredPath("node_modules/pkg/index.js")).toBe(true);
    expect(isIgnoredPath("dist/bundle.js")).toBe(true);
    expect(isIgnoredPath("src/index.js")).toBe(false);
  });
});

describe("TC-U-DETECT — countLanguagesFromTree", function () {
  test("TC-U-DETECT-05 compte par taille, ignore node_modules", function () {
    var tree = [
      { path: "src/a.js", type: "blob", size: 1000 },
      { path: "src/b.py", type: "blob", size: 500 },
      { path: "node_modules/x/index.js", type: "blob", size: 99999 },
      { path: "docs/readme.md", type: "blob", size: 200 },
    ];
    var result = countLanguagesFromTree(tree);
    // s'il y a du code, Markdown est exclu du total
    expect(result.counts.JavaScript).toBe(1000);
    expect(result.counts.Python).toBe(500);
    expect(result.counts.Markdown).toBeUndefined();
    expect(result.counts["JavaScript"]).toBeDefined();
  });

  test("TC-U-DETECT-06 seulement Markdown → Markdown présent", function () {
    var tree = [{ path: "README.md", type: "blob", size: 1300 }];
    var result = countLanguagesFromTree(tree);
    expect(result.counts.Markdown).toBe(1300);
    expect(result.codeFileCount).toBe(0);
  });
});
