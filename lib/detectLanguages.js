// correspondance extension → langage
var EXTENSION_MAP = {
  ".js": "JavaScript",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",
  ".jsx": "JavaScript",
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".py": "Python",
  ".pyw": "Python",
  ".rb": "Ruby",
  ".php": "PHP",
  ".java": "Java",
  ".kt": "Kotlin",
  ".kts": "Kotlin",
  ".go": "Go",
  ".rs": "Rust",
  ".c": "C",
  ".h": "C",
  ".cpp": "C++",
  ".cc": "C++",
  ".cxx": "C++",
  ".hpp": "C++",
  ".cs": "C#",
  ".swift": "Swift",
  ".m": "Objective-C",
  ".mm": "Objective-C",
  ".scala": "Scala",
  ".r": "R",
  ".dart": "Dart",
  ".lua": "Lua",
  ".pl": "Perl",
  ".pm": "Perl",
  ".ex": "Elixir",
  ".exs": "Elixir",
  ".erl": "Erlang",
  ".hs": "Haskell",
  ".clj": "Clojure",
  ".cljs": "Clojure",
  ".vue": "Vue",
  ".svelte": "Svelte",
  ".html": "HTML",
  ".htm": "HTML",
  ".css": "CSS",
  ".scss": "SCSS",
  ".sass": "Sass",
  ".less": "Less",
  ".json": "JSON",
  ".yml": "YAML",
  ".yaml": "YAML",
  ".xml": "XML",
  ".md": "Markdown",
  ".mdx": "MDX",
  ".sh": "Shell",
  ".bash": "Shell",
  ".zsh": "Shell",
  ".ps1": "PowerShell",
  ".sql": "SQL",
  ".graphql": "GraphQL",
  ".gql": "GraphQL",
  ".dockerfile": "Dockerfile",
  ".tf": "HCL",
  ".sol": "Solidity",
  ".zig": "Zig",
  ".nim": "Nim",
  ".jl": "Julia",
  ".f90": "Fortran",
  ".f95": "Fortran",
  ".asm": "Assembly",
  ".s": "Assembly",
  ".vue": "Vue",
  ".astro": "Astro",
  ".ipynb": "Jupyter Notebook",
};

// dossiers à ignorer (comme Linguist / .gitignore courants)
var IGNORED_FOLDERS = [
  "node_modules/",
  "vendor/",
  "dist/",
  "build/",
  "out/",
  ".next/",
  "coverage/",
  ".git/",
  "venv/",
  ".venv/",
  "__pycache__/",
  "target/",
  "Pods/",
  "third_party/",
  "third-party/",
  "external/",
];

function isIgnoredPath(path) {
  if (!path) {
    return true;
  }
  var lower = path.toLowerCase().replace(/\\/g, "/");
  var i;
  for (i = 0; i < IGNORED_FOLDERS.length; i++) {
    if (lower.indexOf(IGNORED_FOLDERS[i]) !== -1) {
      return true;
    }
  }
  // fichiers minifiés / lock peu utiles pour les %
  if (lower.endsWith(".min.js") || lower.endsWith(".min.css")) {
    return true;
  }
  if (lower.endsWith("package-lock.json") || lower.endsWith("yarn.lock")) {
    return true;
  }
  return false;
}

function getExtension(path) {
  if (!path || typeof path !== "string") {
    return "";
  }

  var lower = path.toLowerCase();
  var base = lower.split("/").pop();

  if (base === "dockerfile") {
    return ".dockerfile";
  }
  if (base === "makefile") {
    return ".makefile";
  }

  var dot = base.lastIndexOf(".");
  if (dot === -1) {
    return "";
  }
  return base.slice(dot);
}

function languageFromPath(path) {
  var ext = getExtension(path);
  if (ext === ".makefile") {
    return "Makefile";
  }
  if (EXTENSION_MAP[ext]) {
    return EXTENSION_MAP[ext];
  }
  return null;
}

// true si c'est plutôt de la doc / config (pas le coeur du code)
function isDocOrConfigLanguage(lang) {
  if (
    lang === "Markdown" ||
    lang === "MDX" ||
    lang === "JSON" ||
    lang === "YAML" ||
    lang === "XML"
  ) {
    return true;
  }
  return false;
}

// compte les langages par TAILLE (octets), pas par nombre de fichiers
function countLanguagesFromTree(treeItems) {
  var counts = {};
  var fileCount = 0;
  var codeFileCount = 0;
  var i;

  for (i = 0; i < treeItems.length; i++) {
    var item = treeItems[i];
    if (!item || item.type !== "blob") {
      continue;
    }
    if (isIgnoredPath(item.path)) {
      continue;
    }

    var lang = languageFromPath(item.path);
    if (!lang) {
      continue;
    }

    // taille du blob (sinon 1 pour ne pas ignorer le fichier)
    var size = item.size;
    if (!size || size < 1) {
      size = 1;
    }

    if (!counts[lang]) {
      counts[lang] = 0;
    }
    counts[lang] = counts[lang] + size;
    fileCount = fileCount + 1;

    if (!isDocOrConfigLanguage(lang)) {
      codeFileCount = codeFileCount + 1;
    }
  }

  // s'il y a du vrai code, on retire Markdown/JSON/YAML du total
  // pour ne pas que la doc écrase JavaScript, Python, etc.
  if (codeFileCount > 0) {
    var cleaned = {};
    var name;
    for (name in counts) {
      if (Object.prototype.hasOwnProperty.call(counts, name)) {
        if (!isDocOrConfigLanguage(name)) {
          cleaned[name] = counts[name];
        }
      }
    }
    // si cleaned a au moins 1 langage, on l'utilise
    var cleanedCount = 0;
    for (name in cleaned) {
      if (Object.prototype.hasOwnProperty.call(cleaned, name)) {
        cleanedCount = cleanedCount + 1;
      }
    }
    if (cleanedCount > 0) {
      counts = cleaned;
    }
  }

  return {
    counts: counts,
    fileCount: fileCount,
    codeFileCount: codeFileCount,
  };
}

export {
  EXTENSION_MAP,
  getExtension,
  languageFromPath,
  countLanguagesFromTree,
  isIgnoredPath,
  isDocOrConfigLanguage,
};
