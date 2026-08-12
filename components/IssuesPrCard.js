function IssuesPrCard(props) {
  var issues = props.issues;
  var pulls = props.pulls;
  var issuesCount = issues ? issues.count : 0;
  var pullsCount = pulls ? pulls.count : 0;
  var issueList = issues && issues.issues ? issues.issues : [];
  var pullList = pulls && pulls.pulls ? pulls.pulls : [];

  return (
    <div className="card">
      <h2>Issues et pull requests ouvertes</h2>
      <div className="stats-row">
        <div className="stat">
          <strong>{issues ? issuesCount : "—"}</strong>
          <span className="muted">Issues (échantillon)</span>
        </div>
        <div className="stat">
          <strong>{pulls ? pullsCount : "—"}</strong>
          <span className="muted">Pull requests</span>
        </div>
      </div>

      {props.issuesError ? <p className="error">{props.issuesError}</p> : null}
      {props.pullsError ? <p className="error">{props.pullsError}</p> : null}

      <h3>Issues récentes</h3>
      {issueList.length === 0 ? (
        <p className="muted">Aucune issue ouverte dans l&apos;échantillon.</p>
      ) : (
        <ul className="list-plain">
          {issueList.slice(0, 5).map(function (item) {
            return (
              <li key={"issue-" + item.number}>
                <a href={item.html_url} target="_blank" rel="noreferrer">
                  #{item.number} {item.title}
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <h3>Pull requests récentes</h3>
      {pullList.length === 0 ? (
        <p className="muted">Aucune pull request ouverte dans l&apos;échantillon.</p>
      ) : (
        <ul className="list-plain">
          {pullList.slice(0, 5).map(function (item) {
            return (
              <li key={"pr-" + item.number}>
                <a href={item.html_url} target="_blank" rel="noreferrer">
                  #{item.number} {item.title}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default IssuesPrCard;
