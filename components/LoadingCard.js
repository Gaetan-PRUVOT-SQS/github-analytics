function LoadingCard(props) {
  return (
    <div className="card">
      <h2>{props.title}</h2>
      <p className="muted">Chargement…</p>
    </div>
  );
}

export default LoadingCard;
