function CommitDetails(props) {
  var commits = props.commits;

  if (!commits) {
    return null;
  }

  return (
    <div className="card">
      <h2>Analyse des commits</h2>
      <p className="muted">
        Basé sur {commits.total} commits (du {commits.firstDate || "—"} au{" "}
        {commits.lastDate || "—"}, soit {commits.spanDays} jours d&apos;échantillon).
      </p>

      <div className="stats-row">
        <div className="stat">
          <strong>{commits.total}</strong>
          <span className="muted">Commits analysés</span>
        </div>
        <div className="stat">
          <strong>{commits.activeDays}</strong>
          <span className="muted">Jours avec activité</span>
        </div>
        <div className="stat">
          <strong>{commits.avgPerActiveDay}</strong>
          <span className="muted">Moy. / jour actif</span>
        </div>
        <div className="stat">
          <strong>{commits.avgOverSpan}</strong>
          <span className="muted">Moy. / jour (période)</span>
        </div>
        <div className="stat">
          <strong>{commits.authorCount}</strong>
          <span className="muted">Auteurs</span>
        </div>
        <div className="stat">
          <strong>{commits.avgMessageLength}</strong>
          <span className="muted">Long. moy. message</span>
        </div>
      </div>

      <h3>Top 5 jours les plus chargés</h3>
      {commits.topDays && commits.topDays.length > 0 ? (
        <ul className="list-plain">
          {commits.topDays.map(function (day) {
            return (
              <li key={day.date}>
                {day.date} — <strong>{day.count}</strong> commit(s)
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width:
                        commits.peakDay && commits.peakDay.count > 0
                          ? (day.count / commits.peakDay.count) * 100 + "%"
                          : "0%",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="muted">Pas de données.</p>
      )}

      <h3>Top auteurs (échantillon)</h3>
      {commits.topAuthors && commits.topAuthors.length > 0 ? (
        <ul className="list-plain">
          {commits.topAuthors.map(function (author) {
            return (
              <li key={author.login}>
                {author.login} — {author.count} ({author.percent}%)
                <div className="bar-track">
                  <div
                    className="bar-fill bar-fill-green"
                    style={{ width: author.percent + "%" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="muted">Pas d&apos;auteurs.</p>
      )}
    </div>
  );
}

export default CommitDetails;
