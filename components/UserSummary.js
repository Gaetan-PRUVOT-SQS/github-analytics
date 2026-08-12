function UserSummary(props) {
  var stats = props.stats;

  if (!stats) {
    return null;
  }

  var dominant = "—";
  if (stats.languagesByRepos && stats.languagesByRepos.dominant) {
    var d = stats.languagesByRepos.dominant;
    dominant = d.name + " (" + (d.percentLabel || d.percent + " %") + " des dépôts)";
  }

  return (
    <div className="card">
      <h2>Synthèse du compte</h2>
      <p className="muted">
        Analyse de {stats.repoCount} dépôt(s) public(s)
        {stats.note ? " · " + stats.note : ""}
      </p>

      <div className="stats-row">
        <div className="stat">
          <strong>{stats.totalStars}</strong>
          <span className="muted">Stars totales</span>
        </div>
        <div className="stat">
          <strong>{stats.totalForks}</strong>
          <span className="muted">Forks totaux</span>
        </div>
        <div className="stat">
          <strong>{stats.originalCount}</strong>
          <span className="muted">Dépôts originaux</span>
        </div>
        <div className="stat">
          <strong>{stats.forksCount}</strong>
          <span className="muted">Forks (repos)</span>
        </div>
        <div className="stat">
          <strong>{stats.archivedCount}</strong>
          <span className="muted">Archivés</span>
        </div>
        <div className="stat">
          <strong>{stats.totalSizeLabel || stats.totalSize}</strong>
          <span className="muted">Taille totale</span>
        </div>
        <div className="stat">
          <strong>{stats.totalOpenIssues}</strong>
          <span className="muted">Issues ouvertes</span>
        </div>
      </div>

      <ul className="insight-list">
        <li>
          <strong>Langage le plus utilisé (nb de dépôts) :</strong> {dominant}
        </li>
        <li>
          <strong>Langages distincts :</strong>{" "}
          {stats.languagesByRepos
            ? stats.languagesByRepos.languageCount
            : 0}
        </li>
      </ul>
    </div>
  );
}

export default UserSummary;
