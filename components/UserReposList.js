import Link from "next/link";

function formatDate(iso) {
  if (!iso) {
    return "—";
  }
  return iso.slice(0, 10);
}

function UserReposList(props) {
  var repos = props.repos || [];
  var title = props.title || "Dépôts";

  if (repos.length === 0) {
    return (
      <div className="card">
        <h2>{title}</h2>
        <p className="muted">Aucun dépôt à afficher.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>
        {title} ({repos.length})
      </h2>
      <ul className="list-plain repo-list">
        {repos.map(function (repo) {
          var parts = (repo.full_name || "").split("/");
          var owner = parts[0] || "";
          var name = parts[1] || repo.name;

          return (
            <li key={repo.full_name} className="repo-item">
              <div>
                <Link href={"/repo/" + owner + "/" + name}>
                  <strong>{repo.full_name}</strong>
                </Link>
                {repo.fork ? (
                  <span className="muted"> · fork</span>
                ) : null}
                {repo.archived ? (
                  <span className="muted"> · archivé</span>
                ) : null}
              </div>
              {repo.description ? (
                <p className="muted repo-desc">{repo.description}</p>
              ) : null}
              <p className="muted">
                {repo.language || "—"} · ★ {repo.stargazers_count} · forks{" "}
                {repo.forks_count} · push {formatDate(repo.pushed_at)}
              </p>
              <p>
                <a href={repo.html_url} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                {" · "}
                <Link href={"/repo/" + owner + "/" + name}>Analyser ce dépôt</Link>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default UserReposList;
