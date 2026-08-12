import { getTokenFromRequest, githubFetch, jsonError, jsonOk } from "@/lib/github";
import { repoAgeDays, formatAge } from "@/lib/stats";
import { getSafeUsername } from "@/lib/apiGuard";

export async function GET(request, context) {
  var safe = await getSafeUsername(context);
  if (!safe.ok) {
    return safe.response;
  }

  var username = safe.username;
  var token = getTokenFromRequest(request);

  // d'abord utilisateur, sinon organisation
  var result = await githubFetch("/users/" + username, token);
  var kind = "User";

  if (!result.ok && result.errorCode === "not_found") {
    result = await githubFetch("/orgs/" + username, token);
    kind = "Organization";
  }

  if (!result.ok) {
    if (result.errorCode === "not_found") {
      return jsonError({
        status: 404,
        errorCode: "not_found",
        message: "Utilisateur ou organisation introuvable",
      });
    }
    return jsonError(result);
  }

  var data = result.data;
  var ageDays = repoAgeDays(data.created_at);

  return jsonOk({
    login: data.login,
    name: data.name || data.login,
    type: data.type || kind,
    bio: data.bio || null,
    company: data.company || null,
    blog: data.blog || null,
    location: data.location || null,
    email: data.email || null,
    html_url: data.html_url,
    avatar_url: data.avatar_url,
    public_repos: data.public_repos || 0,
    public_gists: data.public_gists || 0,
    followers: data.followers || 0,
    following: data.following || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    ageDays: ageDays,
    ageLabel: formatAge(ageDays),
  });
}
