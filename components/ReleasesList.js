function formatDate(iso) {
  if (!iso) {
    return "—";
  }
  return iso.slice(0, 10);
}

function ReleasesList(props) {
  var releases = props.releases || [];

  if (releases.length === 0) {
    return (
      <div className="card">
        <h2>Releases</h2>
        <p className="muted">Aucune release publiée.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Releases</h2>
      <ul className="list-plain">
        {releases.map(function (item) {
          return (
            <li key={item.tag_name}>
              <a href={item.html_url} target="_blank" rel="noreferrer">
                {item.tag_name}
              </a>
              {" — "}
              {item.name || "sans titre"}
              <span className="muted"> ({formatDate(item.published_at)})</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ReleasesList;
