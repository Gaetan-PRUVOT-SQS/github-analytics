function ContributorsList(props) {
  var contributors = props.contributors || [];
  var totalContributions = props.totalContributions || 0;
  var contributorCount = props.contributorCount || contributors.length;

  if (contributors.length === 0) {
    return (
      <div className="card">
        <h2>Contributeurs</h2>
        <p className="muted">Aucun contributeur trouvé.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Contributeurs</h2>
      <p className="muted">
        {contributorCount} contributeur(s) · {totalContributions} contributions
        au total (top {contributors.length})
      </p>
      <ul className="list-plain">
        {contributors.map(function (person) {
          return (
            <li key={person.login} className="contributor-row">
              <div className="contributor">
                <img src={person.avatar_url} alt="" />
                <div>
                  <a href={person.html_url} target="_blank" rel="noreferrer">
                    {person.login}
                  </a>
                  <div className="muted">
                    {person.contributions} contributions ({person.percent}%)
                  </div>
                </div>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bar-fill-green"
                  style={{ width: person.percent + "%" }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ContributorsList;
