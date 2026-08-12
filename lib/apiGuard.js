import { validateRepoParams, validateUsername, badRequest } from "./security";

// lit et valide owner/repo depuis une route Next
async function getSafeRepoParams(context) {
  var params = await context.params;
  var checked = validateRepoParams(params.owner, params.repo);
  if (!checked.ok) {
    return {
      ok: false,
      owner: null,
      repo: null,
      response: badRequest(checked.message),
    };
  }
  return {
    ok: true,
    owner: checked.owner,
    repo: checked.repo,
    response: null,
  };
}

async function getSafeUsername(context) {
  var params = await context.params;
  var checked = validateUsername(params.username);
  if (!checked.ok) {
    return {
      ok: false,
      username: null,
      response: badRequest(checked.message),
    };
  }
  return {
    ok: true,
    username: checked.username,
    response: null,
  };
}

export { getSafeRepoParams, getSafeUsername };
