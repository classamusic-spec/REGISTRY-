"use client";

import { useEffect, useState } from "react";
import data from "../../data/registry.json";

const byId = Object.fromEntries(data.items.map((i) => [i.id, i]));
const KEY = "hunny-registry:admin";

export default function Admin() {
  const [key, setKey] = useState("");
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  async function load(k = key) {
    setError(null);
    const res = await fetch("/api/admin", { headers: { "x-admin-key": k }, cache: "no-store" });
    if (!res.ok) {
      setState(null);
      setError(res.status === 401 ? "That key didn't work." : "Couldn't load purchases.");
      return;
    }
    try {
      sessionStorage.setItem(KEY, k);
    } catch {}
    setState(await res.json());
  }

  useEffect(() => {
    let saved = "";
    try {
      saved = sessionStorage.getItem(KEY) || "";
    } catch {}
    if (saved) {
      setKey(saved);
      load(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(body) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify(body),
    });
    load();
  }

  return (
    <main className="sheet">
      <div className="admin">
        <h1 className="title" style={{ fontSize: 72, textAlign: "center" }}>
          host view
        </h1>

        {!state ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}
          >
            <input
              type="password"
              placeholder="Admin key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 999, border: "1.5px solid var(--line)" }}
            />
            <button className="btn btn-honey">Open</button>
            {error ? <p className="error" style={{ width: "100%", textAlign: "center" }}>{error}</p> : null}
          </form>
        ) : (
          <>
            {!state.hasDatabase ? (
              <p className="error">
                No database connected — purchases are only kept in memory. Connect Upstash Redis in Vercel → Storage.
              </p>
            ) : null}

            <h2>Purchased items ({Object.keys(state.claims).length})</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>From</th>
                    <th>Note</th>
                    <th>When</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(state.claims)
                    .sort((a, b) => (a[1].at < b[1].at ? 1 : -1))
                    .map(([id, c]) => (
                      <tr key={id}>
                        <td>
                          <a href={byId[id]?.url} target="_blank" rel="noopener noreferrer">
                            {byId[id]?.title || byId[id]?.name || id}
                          </a>
                        </td>
                        <td>{c.name || "—"}</td>
                        <td>{c.note || ""}</td>
                        <td>{new Date(c.at).toLocaleString()}</td>
                        <td>
                          <button
                            className="btn btn-ghost"
                            onClick={() => confirm("Put this item back on the registry?") && act({ action: "release", id })}
                          >
                            un-mark
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <h2>Everything guests reported (incl. diapers, wipes & gift cards)</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>From</th>
                    <th>Note</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {[...state.log].reverse().map((row, i) => (
                    <tr key={i}>
                      <td>{byId[row.id]?.title || byId[row.id]?.name || row.id}</td>
                      <td>{row.name || "—"}</td>
                      <td>{row.note || ""}</td>
                      <td>{new Date(row.at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: 30, textAlign: "center" }}>
              <button
                className="btn btn-ghost"
                onClick={() => prompt('Type RESET to clear every purchase (for testing only)') === "RESET" && act({ action: "reset", confirm: "RESET" })}
              >
                Reset all purchases
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
