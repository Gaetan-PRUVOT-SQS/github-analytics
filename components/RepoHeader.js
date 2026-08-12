function formatDate(iso) {
  if (!iso) {
    return "—";
  }
  return iso.slice(0, 10);
}

function RepoHeader(props) {
  var repo = props.repo;

  if (!repo) {
    return null;
  }

  return (
    <div className="card">
      <h2>{repo.full_name}</h2>
      {repo.description ? <p>{repo.description}</p> : null}
      <div className="stats-row">
        <div className="stat">
          <strong>{repo.stargazers_count}</strong>
          <span className="muted">Stars</span>
        </div>
        <div className="stat">
          <strong>{repo.forks_count}</strong>
          <span className="muted">Forks</span>
        </div>
        <div className="stat">
          <strong>{repo.watchers_count}</strong>
          <span className="muted">Watchers</span>
        </div>
        <div className="stat">
          <strong>
            {repo.subscribers_count !== undefined && repo.subscribers_count !== null
              ? repo.subscribers_count
              : "—"}
          </strong>
          <span className="muted">Abonnés</span>
        </div>
        <div className="stat">
          <strong>{repo.license || "—"}</strong>
          <span className="muted">Licence</span>
        </div>
        <div className="stat">
          <strong>{repo.language || "—"}</strong>
          <span className="muted">Langage principal</span>
        </div>
      </div>
      <p className="muted">
        Créé le {formatDate(repo.created_at)} · Mis à jour le{" "}
        {formatDate(repo.updated_at)} · Dernier push le{" "}
        {formatDate(repo.pushed_at)} · Âge : {repo.ageLabel} · Taille :{" "}
        {repo.sizeLabel}
      </p>
      <p>
        <a href={repo.html_url} target="_blank" rel="noreferrer">
          Voir sur GitHub
        </a>
        {repo.homepage ? (
          <span>
            {" · "}
            <a href={repo.homepage} target="_blank" rel="noreferrer">
              Site du projet
            </a>
          </span>
        ) : null}
      </p>
    </div>
  );
}

export default RepoHeader;
