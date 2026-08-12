function Heatmap(props) {
  var heatmap = props.heatmap || [];

  if (heatmap.length === 0) {
    return (
      <div className="card">
        <h2>Heatmap des commits</h2>
        <p className="muted">Pas assez de données.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Heatmap des commits</h2>
      <p className="muted">
        Intensité selon le nombre de commits par jour (échantillon récent).
      </p>
      <div className="heatmap">
        {heatmap.map(function (cell) {
          return (
            <div
              key={cell.date}
              className={"heatmap-cell level-" + cell.level}
              title={cell.date + " : " + cell.count + " commit(s)"}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Heatmap;
