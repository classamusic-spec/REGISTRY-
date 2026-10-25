"use client";

import { useEffect, useState } from "react";
import data from "../../data/registry.json";
import { ImportPreview, PhotoManager, matchImport, readImportFromHash } from "../../components/PhotoTools";
import MarkPurchased from "../../components/MarkPurchased";

const byId = Object.fromEntries(data.items.map((i) => [i.id, i]));
const KEY = "hunny-registry:admin";

export default function Admin() {
  const [key, setKey] = useState("");
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null); // photos found by the bookmarklet, awaiting review

  async function load(k = key) {
    setError(null);
    const res = await fetch("/api/admin", { headers: { "x-admin-key": k }, cache: "no-store" });
    if (!res.ok) {
      setState(null);
      setError(res.status === 401 ? "That key didn't work." : "Couldn't load purchases.");
      return;
    }
    try {
      localStorage.setItem(KEY, k);
    } catch {}
    setState(await res.json());
  }

  useEffect(() => {
    const payload = readImportFromHash();
    if (payload) {
      setPending(matchImport(payload));
      history.replaceState(null, "", location.pathname);
    }
    let saved = "";
    try {
      saved = localStorage.getItem(KEY) || "";
    } catch {}
    if (saved) {
      setKey(saved);
      load(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(body) {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify(body),
    });
    await load();
    return res.ok;
  }

  async function markPurchased({ id, name, note }) {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ action: "claim", id, name, note }),
    });
    await load();
    if (!res.ok) alert((await res.json().catch(() => ({}))).error || "Couldn't save — please try again.");
    return res.ok;
  }

  async function savePhotos(entries) {
    const ok = await act({ action: "meta", entries });
    if (ok) setPending(null);
    else alert("Couldn't save. Is the Upstash Redis database connected in Vercel?");
  }

  return (
    <main className="sheet">
      <div className="admin">
        <h1 className="title" style={{ fontSize: 72, textAlign: "center" }}>
          host view
        </h1>

        {pending && !state ? <p style={{ textAlign: "center" }}>Enter your admin key to review the photos you just grabbed.</p> : null}

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

            {pending ? <ImportPreview entries={pending} onSave={savePhotos} onDiscard={() => setPending(null)} /> : null}

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
                            {state.meta?.[id]?.title || byId[id]?.name || id}
                          </a>
                        </td>
                        <td>
                          {c.name || "—"}
                          {c.byHost ? <small className="hint"> (marked by host)</small> : null}
                        </td>
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

            <MarkPurchased claims={state.claims} meta={state.meta || {}} counts={state.counts || {}} onMark={markPurchased} />

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
                      <td>{state.meta?.[row.id]?.title || byId[row.id]?.name || row.id}</td>
                      <td>{row.name || "—"}</td>
                      <td>{row.note || ""}</td>
                      <td>{new Date(row.at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PhotoManager meta={state.meta || {}} onSave={savePhotos} />

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
