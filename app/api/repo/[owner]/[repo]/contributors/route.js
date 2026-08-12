import { getTokenFromRequest, githubFetch, jsonError, jsonOk } from "@/lib/github";
import { enrichContributors } from "@/lib/stats";
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
    "/repos/" + owner + "/" + repo + "/contributors?per_page=30",
    token
  );

  if (!result.ok) {
    return jsonError(result);
  }

  var list = [];
  var i;
  for (i = 0; i < result.data.length; i++) {
    var item = result.data[i];
    list.push({
      login: item.login,
      avatar_url: item.avatar_url,
      html_url: item.html_url,
      contributions: item.contributions,
    });
  }

  return jsonOk(enrichContributors(list));
}
