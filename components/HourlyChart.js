"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function HourlyChart(props) {
  var byHour = props.byHour || [];

  if (byHour.length === 0) {
    return (
      <div className="card">
        <h2>Activité par heure (UTC)</h2>
        <p className="muted">Pas de données.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Activité par heure (UTC)</h2>
      <p className="muted">
        Répartition des commits de l&apos;échantillon selon l&apos;heure UTC.
      </p>
      <div className="chart chart-tall">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byHour}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" interval={2} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#8250df" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HourlyChart;
