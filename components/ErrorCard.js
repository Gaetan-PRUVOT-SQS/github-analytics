function ErrorCard(props) {
  return (
    <div className="card">
      <h2>{props.title}</h2>
      <p className="error">{props.message}</p>
    </div>
  );
}

export default ErrorCard;
