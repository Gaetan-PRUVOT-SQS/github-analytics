import { getTokenFromRequest, githubFetch, jsonError, jsonOk } from "@/lib/github";
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
    "/repos/" + owner + "/" + repo + "/releases?per_page=10",
    token
  );

  if (!result.ok) {
    return jsonError(result);
  }

  var list = [];
  var i;
  for (i = 0; i < result.data.length; i++) {
    list.push({
      tag_name: result.data[i].tag_name,
      name: result.data[i].name,
      html_url: result.data[i].html_url,
      published_at: result.data[i].published_at,
    });
  }

  return jsonOk({ releases: list });
}
