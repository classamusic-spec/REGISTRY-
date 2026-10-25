"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bee, CategoryIcon } from "./Art";

const TOKENS_KEY = "hunny-registry:mine";
const POLL_MS = 15000;

function loadTokens() {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveTokens(tokens) {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch {}
}

export default function Registry({ items: baseItems, categories }) {
  const [meta, setMeta] = useState({}); // product photos/titles the host imported
  const [taken, setTaken] = useState({});
  const [counts, setCounts] = useState({});
  const [mine, setMine] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("All");
  const [hideTaken, setHideTaken] = useState(false);
  const [active, setActive] = useState(null); // item in the purchase dialog
  const [toast, setToast] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/claims", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setTaken(data.taken || {});
      setCounts(data.counts || {});
      setMeta(data.meta || {});
      setLoaded(true);
    } catch {}
  }, []);

  useEffect(() => {
    setMine(loadTokens());
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    const onFocus = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  const items = useMemo(() => baseItems.map((i) => (meta[i.id] ? { ...i, ...meta[i.id] } : i)), [baseItems, meta]);
  const claimable = items.filter((i) => !i.multi);
  const purchasedCount = claimable.filter((i) => taken[i.id]).length;

  const visible = useMemo(
    () =>
      items.filter(
        (i) => (filter === "All" || i.category === filter) && !(hideTaken && !i.multi && taken[i.id])
      ),
    [items, filter, hideTaken, taken]
  );

  const grouped = categories
    .map((cat) => ({ cat, list: visible.filter((i) => i.category === cat) }))
    .filter((g) => g.list.length);

  async function confirmPurchase(item, name, note) {
    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, name, note }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 409) {
      await refresh();
      return "Oh bother! Someone just marked this one as purchased. Please pick another gift 💛";
    }
    if (!res.ok) return data.error || "Something went wrong — please try again.";

    if (item.multi) {
      setCounts((c) => ({ ...c, [item.id]: data.count }));
      setToast({ text: "Thank you! 🍯" });
    } else {
      const next = { ...loadTokens(), [item.id]: data.token };
      saveTokens(next);
      setMine(next);
      setTaken((t) => ({ ...t, [item.id]: { at: new Date().toISOString() } }));
      setToast({ text: "Marked as purchased — thank you! 🍯", undo: item });
    }
    setActive(null);
    return null;
  }

  async function undo(item) {
    const token = mine[item.id];
    if (!token) return;
    const res = await fetch("/api/claims", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, token }),
    });
    if (res.ok) {
      const next = { ...loadTokens() };
      delete next[item.id];
      saveTokens(next);
      setMine(next);
      setTaken((t) => {
        const copy = { ...t };
        delete copy[item.id];
        return copy;
      });
      setToast({ text: "Okay — it's back on the registry." });
    }
  }

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-inner">
          <div className="chips" role="toolbar" aria-label="Filter by category">
            {["All", ...categories].map((c) => (
              <button key={c} className="chip" aria-pressed={filter === c} onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="status">
            <div className="progress">
              <div className="progress-bar" aria-hidden="true">
                <i style={{ width: `${(purchasedCount / Math.max(claimable.length, 1)) * 100}%` }} />
              </div>
              <span>
                {loaded ? `${purchasedCount} of ${claimable.length} gifts purchased` : "Checking what's been bought…"}
              </span>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={hideTaken} onChange={(e) => setHideTaken(e.target.checked)} />
              <span />
              Hide purchased
            </label>
          </div>
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="empty">Everything here has been bought — what a lucky little hunny! 🐝</p>
      ) : (
        grouped.map(({ cat, list }) => (
          <section className="section" key={cat}>
            <h2>
              {cat}
              {cat === "Gift Cards" || cat === "Diapering" ? null : <small>{list.length} items</small>}
            </h2>
            <div className="grid">
              {list.map((item) => (
                <Card
                  key={item.id}
                  item={item}
                  taken={!item.multi && Boolean(taken[item.id])}
                  count={counts[item.id] || 0}
                  isMine={Boolean(mine[item.id])}
                  onPurchase={() => setActive(item)}
                  onUndo={() => undo(item)}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {active ? <PurchaseDialog item={active} onClose={() => setActive(null)} onConfirm={confirmPurchase} /> : null}

      {toast ? (
        <div className="toast" role="status">
          <span>{toast.text}</span>
          {toast.undo ? (
            <button
              className="btn"
              onClick={() => {
                undo(toast.undo);
              }}
            >
              Undo
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

// Gift cards show their value in the corner; a range or open amount reads "Any amount".
function badgeText(item) {
  if (item.category !== "Gift Cards") return "Stock up!";
  return item.amount && /^\$\d+$/.test(item.amount) ? item.amount : "Any amount";
}

function Card({ item, taken, count, isMine, onPurchase, onUndo }) {
  return (
    <article className={`card${taken ? " is-taken" : ""}`}>
      {taken ? <div className="stamp">Purchased</div> : null}
      {item.multi && !taken ? <div className="badge">{badgeText(item)}</div> : null}

      <div className={`card-media${item.image ? "" : " placeholder"}`}>
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <CategoryIcon category={item.category} />
        )}
      </div>

      <div className="card-body">
        <span className="card-cat">{item.category}</span>
        <h3 className="card-name">
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.title || item.name}
          </a>
        </h3>
        {item.amount ? (
          <p className="card-amount">
            <strong>{item.amount}</strong>
            {item.amountNote ? <span> · {item.amountNote}</span> : null}
          </p>
        ) : null}
        {item.multi && count > 0 ? (
          <p className="card-meta">
            {count} {count === 1 ? "guest has" : "guests have"} sent one 💛
          </p>
        ) : null}

        <div className="card-actions">
          {taken ? (
            <>
              <button className="btn" disabled>
                Purchased ✓
              </button>
              {isMine ? (
                <div className="mine-note">
                  You bought this — thank you!{" "}
                  <button className="btn btn-ghost" onClick={onUndo}>
                    undo
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <button className="btn btn-honey" onClick={onPurchase}>
              Purchase
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function PurchaseDialog({ item, onClose, onConfirm }) {
  const [step, setStep] = useState("open"); // open -> confirm
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function goShop() {
    window.open(item.url, "_blank", "noopener,noreferrer");
    setStep("confirm");
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await onConfirm(item, name, note);
    setBusy(false);
    if (err) setError(err);
  }

  const label = item.title || item.name;

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title" tabIndex={-1} ref={dialogRef}>
        <button className="close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {item.image ? (
          <img className="thumb" src={item.image} alt="" referrerPolicy="no-referrer" />
        ) : (
          <svg viewBox="-24 -30 48 48" width="72" height="72" aria-hidden="true">
            <Bee scale={1.4} />
          </svg>
        )}

        {step === "open" ? (
          <>
            <h3 id="dlg-title">{label}</h3>
            <p>
              We'll open this on Walmart in a new tab. Once you've checked out, come back here and let us know so it
              greys out for everyone else.
            </p>
            <div className="actions">
              <button className="btn btn-honey" onClick={goShop}>
                Open on Walmart ↗
              </button>
              <button className="btn btn-ghost" onClick={() => setStep("confirm")}>
                I already bought it
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <h3 id="dlg-title">Did you buy it?</h3>
            <p>{item.multi ? `Let us know you sent “${label}”.` : `Marking “${label}” as purchased greys it out for the next guest.`}</p>

            <label htmlFor="buyer">Your name (optional — so mom can say thank you)</label>
            <input id="buyer" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />

            <label htmlFor="note">A little note (optional)</label>
            <textarea id="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />

            {error ? <p className="error">{error}</p> : null}

            <div className="actions">
              <button className="btn btn-brown" type="submit" disabled={busy}>
                {busy ? "Saving…" : "Yes, I bought it"}
              </button>
              <button className="btn btn-ghost" type="button" onClick={onClose}>
                Not yet
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
