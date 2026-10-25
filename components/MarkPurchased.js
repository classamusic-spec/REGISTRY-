"use client";

import { useState } from "react";
import data from "../data/registry.json";

// Lets the host mark a gift as bought when a guest forgot to do it themselves.
export default function MarkPurchased({ claims, meta, counts, onMark }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState(null); // item id with the form open
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const q = query.trim().toLowerCase();
  const list = data.items.filter((item) => {
    if (!item.multi && claims[item.id]) return false; // already greyed out
    if (category !== "All" && item.category !== category) return false;
    if (!q) return true;
    return [item.name, meta[item.id]?.title, item.category].some((s) => s && s.toLowerCase().includes(q));
  });

  function open(id) {
    setActive(id);
    setName("");
    setNote("");
  }

  async function submit(e, item) {
    e.preventDefault();
    setBusy(true);
    const ok = await onMark({ id: item.id, name, note });
    setBusy(false);
    if (ok) setActive(null);
  }

  return (
    <section>
      <h2>Mark a gift as purchased</h2>
      <p className="hint">
        For a guest who bought something but didn’t tap “Yes, I bought it”. It greys out for everyone right away.
      </p>

      <div className="mark-filters">
        <input placeholder="Search (e.g. swaddle, monitor)" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {["All", ...data.categories].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mark-list">
        {list.length === 0 ? <p className="hint">Nothing matches — or it’s already marked as purchased.</p> : null}
        {list.map((item) => {
          const m = meta[item.id] || {};
          return (
            <div key={item.id} className="mark-row">
              <div className="mark-item">
                {m.image ? <img src={m.image} alt="" referrerPolicy="no-referrer" /> : <span className="noimg" />}
                <div>
                  <small>{item.category}</small>
                  <div>{m.title || item.name}</div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    view on Walmart ↗
                  </a>
                  {item.multi && counts[item.id] ? <small> · sent {counts[item.id]}×</small> : null}
                </div>
                {active !== item.id ? (
                  <button className="btn btn-honey" onClick={() => open(item.id)}>
                    Mark purchased
                  </button>
                ) : null}
              </div>

              {active === item.id ? (
                <form className="mark-form" onSubmit={(e) => submit(e, item)}>
                  <input placeholder="Who bought it? (optional)" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                  <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                  <button className="btn btn-brown" disabled={busy}>
                    {busy ? "Saving…" : "Confirm"}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setActive(null)}>
                    cancel
                  </button>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
