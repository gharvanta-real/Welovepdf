const metrics = [
  ["Today", "128 files"],
  ["Saved", "42% time"],
  ["Storage", "2.1 GB"],
  ["Plan", "Free"],
];

export function MetricStrip() {
  return (
    <section className="metric-strip" id="usage">
      {metrics.map(([label, value]) => (
        <div className="metric" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}
