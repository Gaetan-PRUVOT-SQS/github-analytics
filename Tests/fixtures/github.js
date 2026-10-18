// réponses figées de l'API GitHub pour les tests fonctionnels et système
// données publiques génériques, aucune donnée personnelle

function repo(owner, name, extra) {
  var base = {
    id: 1000,
    name: name,
    full_name: owner + "/" + name,
    description: "Dépôt de test " + name,
    html_url: "https://github.com/" + owner + "/" + name,
    homepage: null,
    stargazers_count: 1200,
    forks_count: 300,
    watchers_count: 1200,
    subscribers_count: 80,
    network_count: 300,
    open_issues_count: 2,
    language: "JavaScript",
    license: { spdx_id: "MIT" },
    default_branch: "main",
    topics: ["test"],
    size: 2048,
    created_at: "2020-01-15T10:00:00Z",
    updated_at: "2026-10-18T10:00:00Z",
    pushed_at: "2026-10-18T10:00:00Z",
    archived: false,
    fork: false,
    visibility: "public",
  };
  return Object.assign(base, extra || {});
}

function commit(sha, date, login, name, message) {
  return {
    sha: sha,
    commit: {
      author: { name: name, date: date },
      message: message,
    },
    author: login ? { login: login } : null,
  };
}

// 6 commits du lundi 12/10/2026 au dimanche 18/10/2026 (UTC)
var NEXT_COMMITS = [
  commit("c6", "2026-10-18T11:20:00Z", "bob", "Bob", "refactor: split module"),
  commit("c5", "2026-10-17T09:00:00Z", null, "Carol", "chore: bump deps"),
  commit("c4", "2026-10-15T22:05:00Z", "alice", "Alice", "test: cover edge case"),
  commit("c3", "2026-10-13T09:45:00Z", "bob", "Bob", "docs: update readme"),
  commit("c2", "2026-10-12T14:30:00Z", "alice", "Alice", "fix: typo"),
  commit("c1", "2026-10-12T09:15:00Z", "alice", "Alice", "feat: add cache\n\ncorps"),
];

function person(login) {
  return {
    login: login,
    avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
    html_url: "https://github.com/" + login,
  };
}

var ROUTES = {
  "/repos/vercel/next.js": repo("vercel", "next.js", { id: 70107786 }),
  "/repos/vercel/next.js/languages": {
    JavaScript: 6000,
    TypeScript: 3000,
    Rust: 1000,
  },
  "/repos/vercel/next.js/commits": NEXT_COMMITS,

  "/repos/nodejs/node": repo("nodejs", "node", { id: 27193779 }),
  "/repos/nodejs/node/languages": {
    JavaScript: 5000,
    "C++": 3000,
    Python: 1500,
    C: 500,
  },
  "/repos/nodejs/node/contributors": [
    Object.assign(person("alice"), { contributions: 60 }),
    Object.assign(person("bob"), { contributions: 30 }),
    Object.assign(person("carol"), { contributions: 10 }),
  ],
  "/repos/nodejs/node/issues": [
    { number: 3, title: "Bug B", html_url: "https://github.com/nodejs/node/issues/3", user: { login: "bob" } },
    { number: 2, title: "PR comme issue", html_url: "https://github.com/nodejs/node/pull/2", user: { login: "alice" }, pull_request: {} },
    { number: 1, title: "Bug A", html_url: "https://github.com/nodejs/node/issues/1", user: { login: "carol" } },
  ],
  "/repos/nodejs/node/pulls": [
    { number: 2, title: "PR comme issue", html_url: "https://github.com/nodejs/node/pull/2", user: { login: "alice" } },
  ],
  "/repos/nodejs/node/releases": [
    { tag_name: "v24.22.0", name: "v24.22.0", html_url: "https://github.com/nodejs/node/releases/tag/v24.22.0", published_at: "2026-10-14T12:00:00Z" },
    { tag_name: "v24.21.0", name: "v24.21.0", html_url: "https://github.com/nodejs/node/releases/tag/v24.21.0", published_at: "2026-09-07T12:00:00Z" },
  ],

  // cible de facebook/react après transfert vers react/react
  "/repositories/10270250": repo("react", "react", { id: 10270250 }),
  "/repositories/10270250/languages": {
    JavaScript: 8000,
    HTML: 1000,
    CSS: 1000,
  },

  "/users/octocat": {
    login: "octocat",
    name: "The Octocat",
    type: "User",
    bio: null,
    company: "@github",
    blog: "https://github.blog",
    location: "San Francisco",
    email: null,
    html_url: "https://github.com/octocat",
    avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
    public_repos: 3,
    public_gists: 8,
    followers: 100,
    following: 9,
    created_at: "2011-01-25T18:44:36Z",
    updated_at: "2026-10-01T10:00:00Z",
  },
  "/users/octocat/repos": [
    repo("octocat", "Hello-World", { id: 1296269, stargazers_count: 50, forks_count: 40, language: null, size: 1 }),
    repo("octocat", "Spoon-Knife", { id: 1300192, stargazers_count: 30, forks_count: 100, language: "HTML", size: 2 }),
    repo("octocat", "linguist", { id: 1, stargazers_count: 20, forks_count: 5, language: "Ruby", size: 3, fork: true }),
  ],
};

// dépôt transféré : facebook/react répond 301 comme la vraie API
var TRANSFERRED = {
  prefix: "/repos/facebook/react",
  target: "https://api.github.com/repositories/10270250",
};

// redirections piégées : l'app doit refuser sans suivre
var BAD_REDIRECTS = {
  "/repos/evil/redirect": "https://evil.example/repos/evil/redirect",
  "/repos/evil/downgrade": "http://api.github.com/repos/evil/downgrade",
};

var REDIRECT_LOOP = "/repos/loop/forever";
var RATE_LIMITED = "/repos/rate/limited";
// faux token (pas au format PAT) que le faux GitHub refuse en 401
var INVALID_TOKEN = "token_invalide_pour_les_tests";

module.exports = {
  ROUTES,
  TRANSFERRED,
  BAD_REDIRECTS,
  REDIRECT_LOOP,
  RATE_LIMITED,
  INVALID_TOKEN,
};
