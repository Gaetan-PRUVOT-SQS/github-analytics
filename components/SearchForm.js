"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseGitHubInput } from "@/lib/parseGitHubInput";

function SearchForm() {
  const router = useRouter();
  const [repoInput, setRepoInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    var parsed = parseGitHubInput(repoInput);
    if (!parsed) {
      setError(
        "Format invalide. Compte : octocat — Dépôt : owner/repo ou URL GitHub"
      );
      return;
    }

    if (tokenInput.trim() !== "") {
      sessionStorage.setItem("github_token", tokenInput.trim());
    } else {
      sessionStorage.removeItem("github_token");
    }

    if (parsed.type === "user") {
      router.push("/user/" + encodeURIComponent(parsed.username));
      return;
    }

    router.push(
      "/repo/" +
        encodeURIComponent(parsed.owner) +
        "/" +
        encodeURIComponent(parsed.repo)
    );
  }

  return (
    <form className="search card" onSubmit={handleSubmit}>
      <label>
        Compte ou dépôt GitHub
        <input
          type="text"
          placeholder="utilisateur  ou  owner/repo  ou  URL"
          value={repoInput}
          onChange={function (e) {
            setRepoInput(e.target.value);
            if (error) {
              setError("");
            }
          }}
        />
      </label>

      <p className="muted">
        <strong>Tout le compte :</strong> <code>octocat</code> ou{" "}
        <code>https://github.com/octocat</code>
        <br />
        <strong>Un dépôt :</strong> <code>vercel/next.js</code> ou URL complète
      </p>

      <label>
        Token GitHub (optionnel)
        <input
          type="password"
          placeholder="colle ton token ici (optionnel)"
          value={tokenInput}
          onChange={function (e) {
            setTokenInput(e.target.value);
          }}
        />
      </label>

      <p className="muted">
        Le token reste dans cet onglet (sessionStorage). Recommandé pour analyser
        un compte avec beaucoup de dépôts.{" "}
        <a
          href="https://github.com/settings/tokens"
          target="_blank"
          rel="noreferrer"
        >
          Créer un token
        </a>
      </p>

      {error ? <p className="error">{error}</p> : null}

      <button type="submit" className="button">
        Analyser
      </button>
    </form>
  );
}

export default SearchForm;
