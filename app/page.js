import SearchForm from "../components/SearchForm";

export default function HomePage() {
  return (
    <div>
      <h2>Analyser GitHub</h2>
      <p className="muted">
        Analyse un <strong>compte entier</strong> (tous les dépôts publics) ou un{" "}
        <strong>dépôt précis</strong> : langages, commits, contributeurs, issues…
      </p>
      <SearchForm />
    </div>
  );
}
