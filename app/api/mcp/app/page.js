
"use client";

import { useState } from "react";

export default function Home() {
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAccounts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "get_my_accounts" })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Could not load accounts");
      }

      setAccounts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      fontFamily: "Arial, sans-serif",
      maxWidth: 1100,
      margin: "40px auto",
      padding: 24,
      color: "#172033"
    }}>
      <header>
        <p style={{ color: "#64748b" }}>FLYTBASE · ACCOUNT QUEST</p>
        <h1>Live Account CRM</h1>
        <p>Account intelligence, deal tracking and next actions.</p>
      </header>

      <button
        onClick={loadAccounts}
        disabled={loading}
        style={{
          background: "#172033",
          color: "white",
          padding: "12px 20px",
          border: 0,
          borderRadius: 8,
          cursor: "pointer"
        }}
      >
        {loading ? "Loading..." : "Load my accounts"}
      </button>

      {error && (
        <p style={{ color: "crimson", marginTop: 20 }}>
          Error: {error}
        </p>
      )}

      {accounts && (
        <section style={{ marginTop: 28 }}>
          <h2>Account data received</h2>
          <pre style={{
            background: "#f1f5f9",
            padding: 20,
            borderRadius: 8,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            fontSize: 13
          }}>
            {JSON.stringify(accounts, null, 2)}
          </pre>
        </section>
      )}

      <footer style={{
        marginTop: 50,
        borderTop: "1px solid #ddd",
        paddingTop: 16,
        color: "#64748b"
      }}>
        FlytBase Account Quest · CRM prototype
      </footer>
    </main>
  );
}
