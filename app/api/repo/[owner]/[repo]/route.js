import { getTokenFromRequest, githubFetch, jsonError, jsonOk } from "@/lib/github";
import { repoAgeDays, formatAge, formatSizeKb } from "@/lib/stats";
import { getSafeRepoParams } from "@/lib/apiGuard";

export async function GET(request, context) {
  var safe = await getSafeRepoParams(context);
  if (!safe.ok) {
    return safe.response;
  }

  var owner = safe.owner;
  var repo = safe.repo;
  var token = getTokenFromRequest(request);
  var result = await githubFetch("/repos/" + owner + "/" + repo, token);

  if (!result.ok) {
    return jsonError(result);
  }

  var data = result.data;
  var ageDays = repoAgeDays(data.created_at);
  var stars = data.stargazers_count || 0;
  var forks = data.forks_count || 0;
  var starsPerFork = null;
  if (forks > 0) {
    starsPerFork = Math.round((stars / forks) * 10) / 10;
  }

  return jsonOk({
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    html_url: data.html_url,
    homepage: data.homepage || null,
    stargazers_count: stars,
    forks_count: forks,
    watchers_count: data.watchers_count,
    subscribers_count: data.subscribers_count,
    network_count: data.network_count,
    open_issues_count: data.open_issues_count,
    language: data.language,
    license: data.license ? data.license.spdx_id : null,
    default_branch: data.default_branch,
    topics: data.topics || [],
    size: data.size,
    sizeLabel: formatSizeKb(data.size),
    created_at: data.created_at,
    updated_at: data.updated_at,
    pushed_at: data.pushed_at,
    ageDays: ageDays,
    ageLabel: formatAge(ageDays),
    starsPerFork: starsPerFork,
    archived: data.archived,
    fork: data.fork,
    visibility: data.visibility || (data.private ? "private" : "public"),
  });
}
