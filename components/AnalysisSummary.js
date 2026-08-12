function AnalysisSummary(props) {
  var repo = props.repo;
  var languages = props.languages;
  var contributors = props.contributors;
  var commits = props.commits;

  if (!repo) {
    return null;
  }

  var dominantLang = "—";
  if (languages && languages.dominant) {
    var domPct =
      languages.dominant.percentLabel || languages.dominant.percent + " %";
    dominantLang = languages.dominant.name + " (" + domPct + ")";
  }

  var topContributor = "—";
  if (contributors && contributors.topContributor) {
    topContributor =
      contributors.topContributor.login +
      " (" +
      contributors.topContributor.percent +
      "%)";
  }

  var avgCommits = "—";
  var peakDayLabel = "—";
  var peakWeekdayLabel = "—";
  var peakHourLabel = "—";
  var authorCount = "—";

  if (commits) {
    avgCommits = commits.avgOverSpan + " / jour";
    if (commits.peakDay) {
      peakDayLabel =
        commits.peakDay.date + " (" + commits.peakDay.count + " commits)";
    }
    if (commits.peakWeekday) {
      peakWeekdayLabel =
        commits.peakWeekday.day + " (" + commits.peakWeekday.count + ")";
    }
    if (commits.peakHour) {
      peakHourLabel =
        commits.peakHour.hour + " UTC (" + commits.peakHour.count + ")";
    }
    authorCount = String(commits.authorCount);
  }

  var starsPerFork = "—";
  if (repo.starsPerFork !== null && repo.starsPerFork !== undefined) {
    starsPerFork = String(repo.starsPerFork);
  }

  return (
    <div className="card">
      <h2>Synthèse détaillée</h2>
      <p className="muted">
        Vue d&apos;ensemble calculée à partir des infos du dépôt et d&apos;un
        échantillon des 100 derniers commits.
      </p>
      <div className="stats-row">
        <div className="stat">
          <strong>{repo.ageLabel}</strong>
          <span className="muted">Âge du dépôt</span>
        </div>
        <div className="stat">
          <strong>{repo.sizeLabel}</strong>
          <span className="muted">Taille</span>
        </div>
        <div className="stat">
          <strong>{repo.open_issues_count}</strong>
          <span className="muted">Issues + PR ouvertes</span>
        </div>
        <div className="stat">
          <strong>{starsPerFork}</strong>
          <span className="muted">Stars / fork</span>
        </div>
        <div className="stat">
          <strong>{repo.default_branch || "—"}</strong>
          <span className="muted">Branche par défaut</span>
        </div>
        <div className="stat">
          <strong>{repo.visibility || "—"}</strong>
          <span className="muted">Visibilité</span>
        </div>
      </div>

      {languages && languages.documentationOnly ? (
        <p className="info-banner">
          {languages.infoMessage ||
            "Dépôt de documentation uniquement (souvent un README de profil). Pas de langage de programmation à analyser."}
        </p>
      ) : null}

      <ul className="insight-list">
        <li>
          <strong>Langage dominant :</strong> {dominantLang}
        </li>
        <li>
          <strong>Meilleur contributeur :</strong> {topContributor}
        </li>
        <li>
          <strong>Moyenne de commits (échantillon) :</strong> {avgCommits}
        </li>
        <li>
          <strong>Jour le plus actif :</strong> {peakDayLabel}
        </li>
        <li>
          <strong>Jour de la semaine le plus actif :</strong> {peakWeekdayLabel}
        </li>
        <li>
          <strong>Heure UTC la plus active :</strong> {peakHourLabel}
        </li>
        <li>
          <strong>Auteurs distincts (échantillon) :</strong> {authorCount}
        </li>
        {repo.archived ? (
          <li className="error">
            <strong>Attention :</strong> ce dépôt est archivé.
          </li>
        ) : null}
        {repo.fork ? (
          <li>
            <strong>Note :</strong> ce dépôt est un fork.
          </li>
        ) : null}
      </ul>

      {repo.topics && repo.topics.length > 0 ? (
        <div className="topics">
          <p className="muted">Topics</p>
          <div className="topic-list">
            {repo.topics.map(function (topic) {
              return (
                <span key={topic} className="topic">
                  {topic}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AnalysisSummary;
