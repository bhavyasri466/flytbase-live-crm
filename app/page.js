
"use client";

import { useState } from "react";

export default function Home() {
  const [accounts, setAccounts] = useState(null);
  const [signals, setSignals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  async function callMCP(name, args = {}) {
    const response = await fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, arguments: args })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "MCP request failed");
    }

    return data;
  }

  async function loadAccounts() {
    setLoading(true);
    setError("");

    try {
      const data = await callMCP("get_my_accounts");
      setAccounts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSignals() {
    setError("");

    try {
      const data = await callMCP("get_signals");
      setSignals(data);
    } catch (err) {
      setError(err.message);
    }
  }

  const accountList = Array.isArray(accounts)
    ? accounts
    : accounts?.accounts || accounts?.data || [];

  const selectedAccount = accountList[activeTab];

  const panel = {
    padding: 20,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    marginBottom: 18
  };

  const button = {
    padding: "11px 16px",
    border: 0,
    borderRadius: 8,
    background: "#172554",
    color: "white",
    cursor: "pointer",
    marginRight: 10,
    marginBottom: 10
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f8fafc",
      color: "#172033",
      fontFamily: "Arial, sans-serif",
      padding: "30px 5%",
    }}>
      <header style={{ marginBottom: 28 }}>
        <p style={{
          color: "#2563eb",
          fontWeight: "bold",
          letterSpacing: 2
        }}>
          FLYTBASE · ACCOUNT QUEST
        </p>
        <h1 style={{ fontSize: 34, marginBottom: 8 }}>
          Live Account CRM
        </h1>
        <p style={{ color: "#64748b" }}>
          Account intelligence · Deal tracking · Customer relationships
        </p>
      </header>

      <section style={panel}>
        <h2>Data connection</h2>
        <p style={{ color: "#64748b" }}>
          Retrieve your actual account information from the FlytBase MCP.
        </p>

        <button
          style={button}
          onClick={loadAccounts}
          disabled={loading}
        >
          {loading ? "Loading accounts..." : "Load my accounts"}
        </button>

        <button style={button} onClick={loadSignals}>
          Check live signals
        </button>

        {error && (
          <p style={{ color: "#dc2626" }}>Error: {error}</p>
        )}
      </section>

      {accounts && (
        <>
          <section style={panel}>
            <h2>Account overview</h2>

            <p>
              Accounts received: <strong>{accountList.length || "See raw data below"}</strong>
            </p>

            {accountList.length > 0 && (
              <div style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap"
              }}>
                {accountList.map((account, index) => (
                  <button
                    key={account.id || account.account_id || index}
                    style={{
                      ...button,
                      background: activeTab === index ? "#2563eb" : "#475569"
                    }}
                    onClick={() => setActiveTab(index)}
                  >
                    {account.name || account.account_name || `Account ${index + 1}`}
                  </button>
                ))}
              </div>
            )}
          </section>

          {selectedAccount && (
            <section style={panel}>
              <h2>
                {selectedAccount.name ||
                  selectedAccount.account_name ||
                  "Selected account"}
              </h2>

              <h3>1. What is the book worth?</h3>
              <p>Deal values and supporting evidence:</p>
              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {JSON.stringify(
                  selectedAccount.deals || "Deal records not identified in this response",
                  null,
                  2
                )}
              </pre>

              <h3>2. Who holds the power?</h3>
              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {JSON.stringify(
                  selectedAccount.people || selectedAccount.contacts || "People records not identified",
                  null,
                  2
                )}
              </pre>

              <h3>3. What do you do first?</h3>
              <p>
                First actions must be ranked and assigned using verified
                deadlines, owners and deal records.
              </p>

              <h3>4. What is about to go wrong?</h3>
              <p>
                Review verified deadlines, relationship status and blocked deals.
              </p>

              <h3>5. What do you still not know?</h3>
              <p>
                Record missing evidence and the person who can provide it.
              </p>
            </section>
          )}

          <section style={panel}>
            <h2>Complete source data</h2>
            <pre style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              fontSize: 12,
              maxHeight: 600,
              overflow: "auto"
            }}>
              {JSON.stringify(accounts, null, 2)}
            </pre>
          </section>
        </>
      )}

      {signals && (
        <section style={panel}>
          <h2>Live signals</h2>
          <pre style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere"
          }}>
            {JSON.stringify(signals, null, 2)}
          </pre>
        </section>
      )}

      <footer style={{
        color: "#64748b",
        padding: 20,
        textAlign: "center"
      }}>
        FlytBase Live CRM · Evidence-first account management
      </footer>
    </main>
  );
}
