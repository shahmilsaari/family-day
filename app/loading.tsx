export default function Loading() {
  return (
    <main className="page-shell loading-page-shell">
      <section className="glass-panel panel-pad stack loading-card">
        <div className="loading-spinner" />
        <div className="loading-text">
          <strong>Loading Family Day…</strong>
          <span className="muted">Preparing your event workspace</span>
        </div>
      </section>
    </main>
  );
}
