import { getTokenFromRequest, githubFetch, jsonError, jsonOk } from "@/lib/github";
import { aggregateRepos } from "@/lib/userStats";
import { formatSizeKb } from "@/lib/stats";
import { getSafeUsername } from "@/lib/apiGuard";

// récupère jusqu'à 3 pages de dépôts (300 max) pour un user/org
async function fetchAllRepos(username, token, isOrg) {
  var all = [];
  var page = 1;
  var maxPages = 3;

  while (page <= maxPages) {
    var path;
    if (isOrg) {
      path =
        "/orgs/" +
        username +
        "/repos?per_page=100&page=" +
        page +
        "&type=public&sort=updated";
    } else {
      path =
        "/users/" +
        username +
        "/repos?per_page=100&page=" +
        page +
        "&type=owner&sort=updated";
    }

    var result = await githubFetch(path, token);
    if (!result.ok) {
      return { ok: false, result: result, repos: all };
    }

    var batch = result.data || [];
    for (var i = 0; i < batch.length; i++) {
      all.push(batch[i]);
    }

    // page incomplète = fin
    if (batch.length < 100) {
      break;
    }
    page = page + 1;
  }

  return { ok: true, result: null, repos: all };
}

export async function GET(request, context) {
  var safe = await getSafeUsername(context);
  if (!safe.ok) {
    return safe.response;
  }

  var username = safe.username;
  var token = getTokenFromRequest(request);

  // détecter user vs org
  var userResult = await githubFetch("/users/" + username, token);
  var isOrg = false;

  if (!userResult.ok && userResult.errorCode === "not_found") {
    var orgResult = await githubFetch("/orgs/" + username, token);
    if (!orgResult.ok) {
      return jsonError({
        status: 404,
        errorCode: "not_found",
        message: "Utilisateur ou organisation introuvable",
      });
    }
    isOrg = true;
  } else if (!userResult.ok) {
    return jsonError(userResult);
  } else {
    isOrg = userResult.data.type === "Organization";
  }

  var fetched = await fetchAllRepos(username, token, isOrg);
  if (!fetched.ok) {
    return jsonError(fetched.result);
  }

  var stats = aggregateRepos(fetched.repos);
  stats.totalSizeLabel = formatSizeKb(stats.totalSize);
  stats.isOrg = isOrg;
  stats.username = username;
  stats.pagesFetched = Math.ceil(fetched.repos.length / 100) || 1;
  stats.note =
    "Jusqu'à 300 dépôts publics (3 pages). Langages = langage principal déclaré par dépôt.";

  return jsonOk(stats);
}
