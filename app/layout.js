import "../styles/globals.css";
import ThemeToggle from "../components/ThemeToggle";

export const metadata = {
  title: "GitHub Analytics",
  description: "Tableau de bord d'analyse de dépôts GitHub",
};

export default function RootLayout(props) {
  return (
    <html lang="fr" className="light" suppressHydrationWarning>
      <body>
        <header className="header">
          <h1>GitHub Analytics</h1>
          <ThemeToggle />
        </header>
        <div className="main">{props.children}</div>
      </body>
    </html>
  );
}
