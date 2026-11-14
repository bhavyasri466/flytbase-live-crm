
"use client";

import { useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [signals, setSignals] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  async function callMCP(name, args = {}) {
    const response = await fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, arguments: args })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || "MCP request failed");
    }

    return result;
  }

  async function loadAccounts() {
    setLoading(true);
    setError("");

    try {
      const result = await callMCP("get_my_accounts");
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSignals() {
    setError("");

    try {
      setSignals(await callMCP("get_signals"));
    } catch (e) {
      setError(e.message);
    }
  }

  const accounts = data?.accounts || [];
  const account = accounts[active];

  const card = {
    background: "white",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    marginBottom: 18
  };

  const heading = {
    color: "#172554",
    fontSize: 19,
    marginBottom: 12
  };

  const muted = { color: "#64748b", fontSize: 13 };

  const button = {
    padding: "11px 16px",
    border: 0,
    borderRadius: 8,
    background: "#1d4ed8",
    color: "white",
    cursor: "pointer",
    margin: "4px"
  };

  function Evidence({ ids }) {
    if (!ids?.length) {
      return <p style={muted}>No source IDs supplied.</p>;
    }

    return (
      <p style={{ ...muted, overflowWrap: "anywhere" }}>
        Evidence IDs: {ids.join(", ")}
      </p>
    );
  }

  return (
    <main style={{
      fontFamily: "Arial, sans-serif",
      background: "#f1f5f9",
      color: "#172033",
      minHeight: "100vh",
      padding: "28px 5%"
    }}>
      <header style={{ marginBottom: 25 }}>
        <p style={{ color: "#2563eb", fontWeight: "bold" }}>
          FLYTBASE · ACCOUNT QUEST
        </p>
        <h1 style={{ fontSize: 32 }}>Live Account CRM</h1>
        <p style={muted}>
          Evidence-first account intelligence and deal management
        </p>
      </header>

      <section style={card}>
        <h2 style={heading}>Data connection</h2>
        <button style={button} onClick={loadAccounts} disabled={loading}>
          {loading ? "Loading..." : "Load account data"}
        </button>
        <button style={button} onClick={loadSignals}>
          Check live signals
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {data && (
          <p style={{ color: "#15803d" }}>
            Successfully retrieved {accounts.length} account records.
          </p>
        )}
      </section>

      {accounts.length > 0 && (
        <>
          <section style={card}>
            <h2 style={heading}>Your accounts</h2>
            {accounts.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setActive(i)}
                style={{
                  ...button,
                  background: active === i ? "#172554" : "#64748b"
                }}
              >
                {a.name}
              </button>
            ))}
          </section>

          {account && (
            <>
              <section style={card}>
                <h2 style={heading}>{account.name}</h2>
                <p>{account.official_story}</p>
                <p style={muted}>
                  Account ID: {account.id}
                </p>
              </section>

              <section style={card}>
                <h2 style={heading}>1. What is the book worth?</h2>
                <h3>Opportunities — potential values, not guaranteed revenue</h3>

                {(account.opportunities || []).length === 0 && (
                  <p>No opportunity records supplied for this account.
                    Do not treat open offers as committed revenue.</p>
                )}

                {(account.opportunities || []).map((deal) => (
                  <div key={deal.id} style={{
                    borderTop: "1px solid #e2e8f0",
                    padding: "14px 0"
                  }}>
                    <h3>{deal.title}</h3>
                    <p>
                      Potential value up to:{" "}
                      <strong>
                        {deal.worth_up_to == null
                          ? "Not provided"
                          : "£" + deal.worth_up_to.toLocaleString("en-GB")}
                      </strong>
                    </p>
                    <p>Stage: {deal.stage}</p>
                    <p>Blocker: {deal.blocker?.text || "Not supplied"}</p>
                    <p>Blocker status: {deal.blocker?.status || "Unknown"}</p>
                    <Evidence ids={deal.evidence} />
                    {deal.deadline && (
                      <p>
                        Deadline: {deal.deadline.text}
                        {deal.deadline.moves_left != null
                          ? ` (${deal.deadline.moves_left} moves left)`
                          : ""}
                      </p>
                    )}
                  </div>
                ))}

                <h3>Offers</h3>
                {(account.offers || []).map((offer) => (
                  <div key={offer.id}>
                    <p>
                      <strong>{offer.title}</strong> — £
                      {offer.value.toLocaleString("en-GB")} — {offer.status}
                    </p>
                    <p style={muted}>
                      Offer ID: {offer.id} · Pitch to: {offer.pitch_to}
                    </p>
                  </div>
                ))}
              </section>

              <section style={card}>
                <h2 style={heading}>2. Who holds the power?</h2>
                {(account.stakeholders || []).map((person) => (
                  <div key={person.id} style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #e2e8f0"
                  }}>
                    <strong>{person.name}</strong>
                    <p>{person.role}</p>
                    <p style={muted}>
                      Relationship: {person.relationship} ·
                      Available: {person.available ? "Yes" : "No"} ·
                      ID: {person.id}
                    </p>
                  </div>
                ))}
                <p style={muted}>
                  Decision-maker, payer and blocker must be confirmed
                  separately; job titles alone do not prove authority.
                </p>
              </section>

              <section style={card}>
                <h2 style={heading}>3. What do you do first?</h2>
                {(account.id === "A" ? [
                  {
                    rank: 1,
                    task: "Obtain the drone staffing and overtime breakdown and complete the cost-per-flight comparison.",
                    owner: "CSM to coordinate with Ewan Brooks",
                    reason: "Metro Central finance bid window",
                    source: ["eb_drone_2", "eb_sign_2", "eb_window_2"]
                  },
                  {
                    rank: 2,
                    task: "Obtain and send the data-flow pack to Fatima Osei.",
                    owner: "CSM with SRV / Engineering",
                    reason: "DPIA approval is blocked",
                    source: ["fo_dpia_2", "fo_needs_3", "srv_dataflow"]
                  },
                  {
                    rank: 3,
                    task: "Reconcile force-level dock usage against the flight log.",
                    owner: "CSM with Karen Mbeki and Rhys Calder",
                    reason: "Renewal blocker is unverified force-level usage",
                    source: ["km_usage_1", "rc_appetite_2"]
                  }
                ] : [
                  {
                    rank: 1,
                    task: "Validate the ROI calculations with operational and financial evidence.",
                    owner: "CSM with Stefan Roy",
                    reason: "Official story says ROI is proven, but this export contains no supporting facts.",
                    source: []
                  },
                  {
                    rank: 2,
                    task: "Confirm Plant 7's operational requirements with Beatriz Alonso.",
                    owner: "CSM with Beatriz Alonso",
                    reason: "Plant 7 support offer remains open.",
                    source: ["b_priority_support"]
                  },
                  {
                    rank: 3,
                    task: "Verify the deployment need at Plant 15 and the two idle plants.",
                    owner: "CSM with Stefan Roy",
                    reason: "Additional plant offer remains open.",
                    source: ["b_more_plants"]
                  }
                ]).map((task) => (
                  <div key={task.rank} style={{
                    padding: 12,
                    borderTop: "1px solid #e2e8f0"
                  }}>
                    <h3>Priority {task.rank}: {task.task}</h3>
                    <p>Owner: {task.owner}</p>
                    <p>Reason: {task.reason}</p>
                    <Evidence ids={task.source} />
                    <p style={muted}>
                      Calendar date not supplied by the account export.
                    </p>
                  </div>
                ))}
              </section>

              <section style={card}>
                <h2 style={heading}>4. What is about to go wrong?</h2>
                {(account.deadlines || []).length === 0 && (
                  <p>No deadline records supplied for this account.</p>
                )}
                {(account.deadlines || []).map((d, i) => (
                  <div key={i}>
                    <p>{d.text}</p>
                    <p style={muted}>
                      Passed: {String(d.passed)}
                    </p>
                  </div>
                ))}
                {(account.opportunities || []).map((d) => (
                  <div key={d.id}>
                    <strong>{d.title}</strong>
                    <p>Blocker: {d.blocker?.text}</p>
                    <p style={muted}>Deal ID: {d.id}</p>
                  </div>
                ))}
                <p style={muted}>
                  Relationship risks are shown in the stakeholder section.
                  No unsupported risk dates are invented.
                </p>
              </section>

              <section style={card}>
                <h2 style={heading}>5. What do you still not know?</h2>
                {account.id === "A" ? (
                  <ul>
                    <li>
                      Comparable drone cost per flight including overtime.
                      Ask Ewan Brooks. Source: eb_drone_2.
                    </li>
                    <li>
                      Whether all four forces have approved their own funding.
                      Source: rc_funding_2.
                    </li>
                    <li>
                      Whether the data-flow pack has been completed and accepted.
                      Ask SRV and Fatima Osei. Sources: srv_dataflow, fo_needs_3.
                    </li>
                    <li>
                      Verified force-by-force usage and renewal evidence.
                      Ask Karen Mbeki. Source: km_usage_1.
                    </li>
                  </ul>
                ) : (
                  <ul>
                    <li>
                      Independently verified ROI and cost savings.
                      Ask Stefan Roy. No supporting fact records were included.
                    </li>
                    <li>
                      Plant 7's exact support requirements.
                      Ask Beatriz Alonso.
                    </li>
                    <li>
                      Actual demand and usage at Plant 15 and the two idle plants.
                      Ask Stefan Roy.
                    </li>
                    <li>
                      Confirmed decision-makers and payers for the offers.
                      Not established by this export.
                    </li>
                  </ul>
                )}
              </section>

              <section style={card}>
                <h2 style={heading}>Source facts and verification</h2>
                {(account.facts || []).map((fact) => (
                  <div key={fact.id} style={{
                    borderTop: "1px solid #e2e8f0",
                    padding: "10px 0"
                  }}>
                    <p>{fact.text}</p>
                    <p style={muted}>
                      Source ID: {fact.id} · Said by: {fact.said_by} ·
                      Status: {fact.status}
                      {fact.verified_by ? ` · Verified by: ${fact.verified_by}` : ""}
                    </p>
                  </div>
                ))}
                {!(account.facts || []).length && (
                  <p>No fact records supplied for this account.</p>
                )}
              </section>
            </>
          )}
        </>
      )}

      {signals && (
        <section style={card}>
          <h2 style={heading}>Live signals</h2>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {JSON.stringify(signals, null, 2)}
          </pre>
        </section>
      )}

      <footer style={{ textAlign: "center", ...muted }}>
        FlytBase Live CRM · Evidence-first account management
      </footer>
    </main>
  );
}
