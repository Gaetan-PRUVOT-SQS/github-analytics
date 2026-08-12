"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

var COLORS = [
  "#0969da",
  "#1a7f37",
  "#bf3989",
  "#bf8700",
  "#cf222e",
  "#8250df",
  "#3192aa",
  "#fa4549",
  "#bc4c00",
  "#0550ae",
  "#6e7781",
  "#bf8700",
  "#8250df",
  "#1a7f37",
];

function LanguageChart(props) {
  var languages = props.languages || [];
  var totalSizeLabel = props.totalSizeLabel || "";
  var languageCount = props.languageCount || languages.length;
  var dominant = props.dominant;
  var sourceLabel = props.sourceLabel || "";
  var detected = props.detected;
  var note = props.note || "";
  var fileCount = props.fileCount;
  var documentationOnly = props.documentationOnly;
  var infoMessage = props.infoMessage || "";

  if (languages.length === 0 || detected === false) {
    return (
      <div className="card">
        <h2>Langages du dépôt</h2>
        <p className="error">Aucun langage détecté sur ce dépôt.</p>
        {note ? <p className="muted">{note}</p> : null}
      </div>
    );
  }

  var unitLabel = "volume total : " + totalSizeLabel;
  if (props.source === "extensions" && fileCount) {
    unitLabel = "échantillon fichiers · " + totalSizeLabel;
  }
  if (props.source === "primary") {
    unitLabel = "langage principal déclaré";
  }

  return (
    <div className="card">
      <h2>Langages du dépôt</h2>
      <p className="muted">
        Liste complète : {languageCount} langage(s) · {unitLabel}
        {dominant
          ? " · dominant : " +
            dominant.name +
            " (" +
            (dominant.percentLabel || dominant.percent + " %") +
            ")"
          : ""}
      </p>
      {sourceLabel ? (
        <p className="badge-source">Source : {sourceLabel}</p>
      ) : null}
      {documentationOnly ? (
        <p className="info-banner">
          {infoMessage ||
            "Ce dépôt ne contient que de la documentation (ex. README). Aucun langage de programmation n'a été trouvé. Ce n'est pas un bug."}
        </p>
      ) : null}
      {note && !documentationOnly ? <p className="muted">{note}</p> : null}

      {/* liste de TOUS les langages avec pourcentage */}
      <h3>Tous les langages ({languageCount})</h3>
      <table className="lang-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Langage</th>
            <th>Pourcentage</th>
            <th>Part</th>
            <th>Détail</th>
          </tr>
        </thead>
        <tbody>
          {languages.map(function (lang, index) {
            var detail = lang.sizeLabel || "";
            if (props.source === "extensions") {
              // value = octets (taille cumulée des fichiers)
              detail = lang.sizeLabel || lang.value + " o";
            }
            if (props.source === "primary") {
              detail = "principal";
            }

            var percentText = lang.percentLabel;
            if (!percentText) {
              percentText = lang.percent + " %";
            }

            return (
              <tr key={lang.name}>
                <td>{index + 1}</td>
                <td className="lang-name">
                  <span
                    className="color-dot"
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  {lang.name}
                </td>
                <td className="lang-percent">
                  <strong>{percentText}</strong>
                </td>
                <td className="lang-bar-cell">
                  <div className="bar-track bar-track-table">
                    <div
                      className="bar-fill"
                      style={{
                        width: Math.min(Math.max(lang.percent, 0.3), 100) + "%",
                        background: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </td>
                <td className="muted">{detail}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={languages}
              dataKey="percent"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
            >
              {languages.map(function (entry, index) {
                return (
                  <Cell
                    key={"cell-" + entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                );
              })}
            </Pie>
            <Tooltip
              formatter={function (value, name) {
                return [value + " %", name];
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default LanguageChart;
