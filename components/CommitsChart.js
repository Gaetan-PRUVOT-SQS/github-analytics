"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function CommitsChart(props) {
  var timeline = props.timeline || [];
  var total = props.total || 0;
  var avgOverSpan = props.avgOverSpan;
  var firstDate = props.firstDate;
  var lastDate = props.lastDate;

  if (timeline.length === 0) {
    return (
      <div className="card">
        <h2>Commits dans le temps</h2>
        <p className="muted">Aucun commit récent.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Commits dans le temps</h2>
      <p className="muted">
        {total} commits · {firstDate || "?"} → {lastDate || "?"}
        {avgOverSpan !== undefined && avgOverSpan !== null
          ? " · moy. " + avgOverSpan + " / jour"
          : ""}
      </p>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" hide={timeline.length > 20} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#0969da" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CommitsChart;
