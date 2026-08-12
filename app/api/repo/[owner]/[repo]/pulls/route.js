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
    "/repos/" + owner + "/" + repo + "/pulls?state=open&per_page=20",
    token
  );

  if (!result.ok) {
    return jsonError(result);
  }

  var list = [];
  var i;
  for (i = 0; i < result.data.length; i++) {
    list.push({
      number: result.data[i].number,
      title: result.data[i].title,
      html_url: result.data[i].html_url,
      user: result.data[i].user ? result.data[i].user.login : null,
    });
  }

  return jsonOk({
    count: list.length,
    pulls: list,
  });
}
