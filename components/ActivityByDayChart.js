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

function ActivityByDayChart(props) {
  var byWeekday = props.byWeekday || [];

  return (
    <div className="card">
      <h2>Activité par jour de la semaine</h2>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byWeekday}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1a7f37" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ActivityByDayChart;
