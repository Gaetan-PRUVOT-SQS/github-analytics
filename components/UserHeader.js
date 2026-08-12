function formatDate(iso) {
  if (!iso) {
    return "—";
  }
  return iso.slice(0, 10);
}

function UserHeader(props) {
  var user = props.user;

  if (!user) {
    return null;
  }

  return (
    <div className="card">
      <div className="user-header">
        {user.avatar_url ? (
          <img
            className="user-avatar"
            src={user.avatar_url}
            alt=""
            width={72}
            height={72}
          />
        ) : null}
        <div>
          <h2>{user.name}</h2>
          <p className="muted">
            @{user.login} · {user.type === "Organization" ? "Organisation" : "Utilisateur"}
          </p>
          {user.bio ? <p>{user.bio}</p> : null}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat">
          <strong>{user.public_repos}</strong>
          <span className="muted">Dépôts publics</span>
        </div>
        <div className="stat">
          <strong>{user.followers}</strong>
          <span className="muted">Followers</span>
        </div>
        <div className="stat">
          <strong>{user.following}</strong>
          <span className="muted">Following</span>
        </div>
        <div className="stat">
          <strong>{user.ageLabel}</strong>
          <span className="muted">Âge du compte</span>
        </div>
      </div>

      <p className="muted">
        {user.location ? user.location + " · " : ""}
        {user.company ? user.company + " · " : ""}
        Créé le {formatDate(user.created_at)}
      </p>

      <p>
        <a href={user.html_url} target="_blank" rel="noreferrer">
          Voir sur GitHub
        </a>
        {user.blog ? (
          <span>
            {" · "}
            <a href={user.blog} target="_blank" rel="noreferrer">
              Site
            </a>
          </span>
        ) : null}
      </p>
    </div>
  );
}

export default UserHeader;
