import { getTokenFromRequest, githubFetch, jsonError, jsonOk } from "@/lib/github";
import { languagesToPercent, markLanguageAnalysis } from "@/lib/stats";
import { countLanguagesFromTree } from "@/lib/detectLanguages";
import { getSafeRepoParams } from "@/lib/apiGuard";

// 1) API officielle GitHub Linguist (la plus fiable)
async function detectFromGithubLanguages(owner, repo, token) {
  var result = await githubFetch(
    "/repos/" + owner + "/" + repo + "/languages",
    token
  );

  if (!result.ok) {
    return { ok: false, result: result, analysis: null };
  }

  // result.data = { "JavaScript": 12345, "CSS": 678, ... }
  var data = result.data;
  if (!data || typeof data !== "object") {
    data = {};
  }

  var analysis = languagesToPercent(data);
  analysis.source = "github";
  analysis.sourceLabel = "API GitHub (Linguist)";
  analysis.detected = analysis.languageCount > 0;
  markLanguageAnalysis(analysis);

  return { ok: true, result: result, analysis: analysis };
}

// 2) secours : arbre Git + extensions (poids = taille des fichiers)
async function detectFromFileTree(owner, repo, token) {
  var repoResult = await githubFetch("/repos/" + owner + "/" + repo, token);
  if (!repoResult.ok) {
    return null;
  }

  var branch = repoResult.data.default_branch;
  if (!branch) {
    return null;
  }

  // sha du dernier commit sur la branche par défaut
  var commitResult = await githubFetch(
    "/repos/" + owner + "/" + repo + "/commits/" + encodeURIComponent(branch),
    token
  );
  if (!commitResult.ok) {
    return null;
  }

  var commitSha = commitResult.data.sha;
  if (!commitSha) {
    return null;
  }

  // tree sha
  var gitCommit = await githubFetch(
    "/repos/" + owner + "/" + repo + "/git/commits/" + commitSha,
    token
  );

  var treeSha = commitSha;
  if (gitCommit.ok && gitCommit.data.tree && gitCommit.data.tree.sha) {
    treeSha = gitCommit.data.tree.sha;
  }

  var treeResult = await githubFetch(
    "/repos/" +
      owner +
      "/" +
      repo +
      "/git/trees/" +
      treeSha +
      "?recursive=1",
    token
  );

  if (!treeResult.ok) {
    return null;
  }

  var tree = treeResult.data.tree || [];
  var counted = countLanguagesFromTree(tree);

  if (!counted.counts || counted.fileCount === 0) {
    return null;
  }

  // au moins un langage ?
  var hasLang = false;
  var key;
  for (key in counted.counts) {
    if (Object.prototype.hasOwnProperty.call(counted.counts, key)) {
      hasLang = true;
      break;
    }
  }
  if (!hasLang) {
    return null;
  }

  var analysis = languagesToPercent(counted.counts);
  analysis.source = "extensions";
  analysis.sourceLabel = "Détection par extensions (taille des fichiers)";
  analysis.detected = analysis.languageCount > 0;
  analysis.fileCount = counted.fileCount;
  markLanguageAnalysis(analysis);
  if (!analysis.documentationOnly) {
    analysis.note =
      "Secours : l'API languages était vide. Comptage par taille des fichiers (Markdown/docs exclus s'il y a du code).";
  }
  return analysis;
}

// 3) secours minimal : champ language du dépôt
async function detectFromPrimaryLanguage(owner, repo, token) {
  var result = await githubFetch("/repos/" + owner + "/" + repo, token);
  if (!result.ok || !result.data.language) {
    return null;
  }

  var fake = {};
  fake[result.data.language] = 1000;
  var analysis = languagesToPercent(fake);
  analysis.source = "primary";
  analysis.sourceLabel = "Langage principal du dépôt";
  analysis.detected = true;
  analysis.note =
    "Détail indisponible. Langage principal annoncé par GitHub uniquement.";
  markLanguageAnalysis(analysis);
  return analysis;
}

export async function GET(request, context) {
  var safe = await getSafeRepoParams(context);
  if (!safe.ok) {
    return safe.response;
  }

  var owner = safe.owner;
  var repo = safe.repo;
  var token = getTokenFromRequest(request);

  // --- priorité 1 : Linguist GitHub ---
  var primary = await detectFromGithubLanguages(owner, repo, token);

  if (!primary.ok) {
    if (primary.result && primary.result.errorCode === "not_found") {
      return jsonError(primary.result);
    }
  }

  // si GitHub renvoie plusieurs langages (ou au moins 1 qui n'est pas que du vide)
  if (primary.ok && primary.analysis && primary.analysis.detected) {
    // cas spécial : API ne renvoie QUE Markdown alors que le repo a un language principal différent
    var onlyMarkdown = false;
    if (
      primary.analysis.languageCount === 1 &&
      primary.analysis.languages[0] &&
      primary.analysis.languages[0].name === "Markdown"
    ) {
      onlyMarkdown = true;
    }

    if (!onlyMarkdown) {
      return jsonOk(markLanguageAnalysis(primary.analysis));
    }

    // si seulement MD, on tente l'arbre pour trouver le vrai code
    var treeAfterMd = await detectFromFileTree(owner, repo, token);
    if (
      treeAfterMd &&
      treeAfterMd.detected &&
      treeAfterMd.languageCount > 0 &&
      !treeAfterMd.documentationOnly
    ) {
      return jsonOk(markLanguageAnalysis(treeAfterMd));
    }

    // sinon on garde le résultat GitHub (vrai dépôt doc)
    return jsonOk(markLanguageAnalysis(primary.analysis));
  }

  // --- priorité 2 : arbre + extensions ---
  var fromTree = await detectFromFileTree(owner, repo, token);
  if (fromTree && fromTree.detected) {
    return jsonOk(markLanguageAnalysis(fromTree));
  }

  // --- priorité 3 : langage principal ---
  var fromPrimary = await detectFromPrimaryLanguage(owner, repo, token);
  if (fromPrimary && fromPrimary.detected) {
    return jsonOk(markLanguageAnalysis(fromPrimary));
  }

  if (primary.ok && primary.analysis) {
    primary.analysis.detected = false;
    primary.analysis.source = "none";
    primary.analysis.sourceLabel = "Aucun langage détecté";
    primary.analysis.note =
      "Aucun fichier de code reconnu. Dépôt vide, ou seulement des assets.";
    primary.analysis.documentationOnly = false;
    primary.analysis.infoMessage = primary.analysis.note;
    return jsonOk(primary.analysis);
  }

  if (primary.result) {
    return jsonError(primary.result);
  }

  return jsonError({
    status: 500,
    errorCode: "api_error",
    message: "Impossible de détecter les langages.",
  });
}
