export default function Loading() {
  return (
    <main className="page-shell" style={{ paddingTop: "48px" }}>
      <div style={{ maxWidth: "540px", margin: "0 auto", textAlign: "center" }}>
        <div className="glass-panel panel-pad stack" style={{ gap: "16px", alignItems: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(8, 116, 67, 0.12)",
              borderTopColor: "var(--accent)",
              borderRadius: "999px",
              animation: "buttonSpin 0.7s linear infinite",
              margin: "0 auto"
            }}
          />
          <strong className="muted">Loading…</strong>
        </div>
      </div>
    </main>
  );
}