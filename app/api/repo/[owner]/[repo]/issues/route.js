import { getTokenFromRequest, githubFetch, jsonError, jsonOk } from "@/lib/github";
import { filterIssuesOnly } from "@/lib/stats";
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
    "/repos/" + owner + "/" + repo + "/issues?state=open&per_page=20",
    token
  );

  if (!result.ok) {
    return jsonError(result);
  }

  var onlyIssues = filterIssuesOnly(result.data);
  var list = [];
  var i;
  for (i = 0; i < onlyIssues.length; i++) {
    list.push({
      number: onlyIssues[i].number,
      title: onlyIssues[i].title,
      html_url: onlyIssues[i].html_url,
      user: onlyIssues[i].user ? onlyIssues[i].user.login : null,
    });
  }

  return jsonOk({
    count: list.length,
    issues: list,
  });
}
