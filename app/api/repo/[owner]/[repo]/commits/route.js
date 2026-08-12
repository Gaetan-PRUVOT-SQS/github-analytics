import { getTokenFromRequest, githubFetch, jsonError, jsonOk } from "@/lib/github";
import { analyzeCommits } from "@/lib/stats";
import { getSafeRepoParams } from "@/lib/apiGuard";

export async function GET(request, context) {
  var safe = await getSafeRepoParams(context);
  if (!safe.ok) {
    return safe.response;
  }

  var owner = safe.owner;
  var repo = safe.repo;
  var token = getTokenFromRequest(request);
  var result = await githubFetch(
    "/repos/" + owner + "/" + repo + "/commits?per_page=100",
    token
  );

  if (!result.ok) {
    return jsonError(result);
  }

  var commits = result.data;
  var analysis = analyzeCommits(commits);

  return jsonOk(analysis);
}
