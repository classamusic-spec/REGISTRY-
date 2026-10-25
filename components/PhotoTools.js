"use client";

import { useEffect, useRef, useState } from "react";
import data from "../data/registry.json";

const byId = Object.fromEntries(data.items.map((i) => [i.id, i]));
const walmartItems = data.items.filter((i) => !i.linkBroken);

// Runs on walmart.com in the host's own browser (Walmart blocks servers and bots,
// but not a person). It collects product ids, titles and photos from the page and
// opens /admin with them in the URL hash for review. When looking for a product
// link's photo it never climbs into a container that holds other products, so a
// tile without its own image can't borrow a neighbour's.
function bookmarkletSource(origin) {
  const fn = `(()=>{
const S=${JSON.stringify(origin)};const out={};
const big=u=>u&&u.indexOf('walmartimages')>-1?u.split('?')[0]+'?odnHeight=450&odnWidth=450&odnBg=FFFFFF':u;
const idOf=h=>{const m=String(h).match(/\\/ip\\/(?:[^/?#]+\\/)?(\\d+)/);return m&&m[1]};
const add=(id,t,i)=>{if(!id)return;const o=out[id]||(out[id]={});if(t&&!o.title)o.title=String(t).trim().replace(/\\s+/g,' ').slice(0,200);if(i&&!o.image)o.image=big(i)};
const page=idOf(location.href);
if(page){const og=n=>{const m=document.querySelector('meta[property="og:'+n+'"]');return m&&m.content};const h=document.querySelector('h1');const im=document.querySelector('[data-testid*="hero"] img,img[src*="walmartimages.com/seo"]');add(page,(h&&h.innerText)||og('title'),og('image')||(im&&im.src))}
const alts={};
const others=(el,id)=>{for(const l of el.querySelectorAll('a[href*="/ip/"]')){const j=idOf(l.href);if(j&&j!==id)return true}return false};
document.querySelectorAll('a[href*="/ip/"]').forEach(a=>{const id=idOf(a.href);if(!id||id===page)return;let c=a,img=null;for(let k=0;k<5&&c&&!img;k++){if(k>0&&others(c,id))break;img=c.querySelector&&c.querySelector('img[src*="walmartimages"]');c=c.parentElement}if(img&&img.alt&&!alts[id])alts[id]=img.alt;add(id,(a.innerText||'').trim(),img&&img.src)});
for(const id in alts)add(id,alts[id]);
const r=location.hash.match(/reg=([\\w-]+)/);
const w=window.open(S+'/admin#import='+encodeURIComponent(JSON.stringify({page:page,reg:r&&r[1],items:out})),'hunnyregistry');
if(!w)alert('Please allow pop-ups for walmart.com, then click the button again.');
})()`;
  return "javascript:" + encodeURIComponent(fn.replace(/\n/g, ""));
}

// Turn what the bookmarklet found into entries for registry items only.
export function matchImport(payload) {
  const found = payload?.items || {};
  const entries = {};
  for (const [id, v] of Object.entries(found)) if (byId[id]) entries[id] = v;
  // Walmart sometimes redirects to a different variant id; the #reg= tag we add to the
  // link tells us which registry item the host opened.
  const { page, reg } = payload || {};
  if (reg && byId[reg] && !entries[reg] && page && found[page]) entries[reg] = found[page];
  return entries;
}

export function readImportFromHash() {
  if (typeof window === "undefined" || !location.hash.startsWith("#import=")) return null;
  try {
    return JSON.parse(decodeURIComponent(location.hash.slice("#import=".length)));
  } catch {
    return null;
  }
}

export function ImportPreview({ entries, onSave, onDiscard }) {
  const ids = Object.keys(entries);
  const [busy, setBusy] = useState(false);
  return (
    <section className="import">
      <h2>Found {ids.length} registry {ids.length === 1 ? "item" : "items"} on that Walmart page</h2>
      {ids.length === 0 ? (
        <p>
          None of the products on that page are on the registry. Try opening an item from the list below (the
          “Open on Walmart” links) and clicking the button there.
        </p>
      ) : (
        <div className="import-grid">
          {ids.map((id) => (
            <div key={id} className="import-row">
              {entries[id].image ? <img src={entries[id].image} alt="" referrerPolicy="no-referrer" /> : <span className="noimg">no photo</span>}
              <div>
                <small>{byId[id].category} · {byId[id].name}</small>
                <div>{entries[id].title || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {ids.length ? (
          <button
            className="btn btn-honey"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onSave(entries);
              setBusy(false);
            }}
          >
            {busy ? "Saving…" : `Save ${ids.length} to the registry`}
          </button>
        ) : null}
        <button className="btn btn-ghost" onClick={onDiscard}>
          {ids.length ? "Discard" : "Close"}
        </button>
      </p>
    </section>
  );
}

export function PhotoManager({ meta, onSave }) {
  const linkRef = useRef(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // React refuses javascript: hrefs, so set it directly.
    linkRef.current?.setAttribute("href", bookmarkletSource(location.origin));
  }, []);

  const withPhoto = walmartItems.filter((i) => meta[i.id]?.image).length;
  const list = data.items.filter((i) => showAll || !meta[i.id]?.image);

  return (
    <section>
      <h2>
        Product photos ({withPhoto} of {walmartItems.length})
      </h2>
      <ol className="howto">
        <li>
          On a computer, drag this button to your bookmarks bar:{" "}
          <a ref={linkRef} className="btn btn-honey bookmarklet" onClick={(e) => e.preventDefault()}>
            🍯 Add to registry
          </a>
        </li>
        <li>
          Open any Walmart page that shows registry items: a product page (use the “Open on Walmart” links below), or
          a page that shows lots of them at once, like your Walmart list, registry, or cart.
        </li>
        <li>Click the 🍯 bookmark. This page opens with what it found. Check it and tap Save.</li>
      </ol>
      <p className="hint">Or paste a photo address by hand (on Walmart, right-click the photo → “Copy image address”).</p>

      <label className="toggle" style={{ margin: "6px 0 12px" }}>
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
        <span />
        Show items that already have a photo
      </label>

      <div className="table-wrap">
        <table>
          <tbody>
            {list.map((item) => (
              <PhotoRow key={item.id} item={item} meta={meta[item.id]} onSave={onSave} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PhotoRow({ item, meta, onSave }) {
  const [image, setImage] = useState(meta?.image || "");
  const [title, setTitle] = useState(meta?.title || "");
  const [saved, setSaved] = useState(false);
  const dirty = image !== (meta?.image || "") || title !== (meta?.title || "");

  return (
    <tr>
      <td style={{ width: 64 }}>
        {image ? <img src={image} alt="" width="56" height="56" style={{ objectFit: "contain", background: "#fff", borderRadius: 8 }} referrerPolicy="no-referrer" /> : null}
      </td>
      <td>
        <small>{item.category}</small>
        <div>{item.name}</div>
        {item.linkBroken ? (
          <small className="error">Link missing: update the url in data/registry.json</small>
        ) : (
          <a href={`${item.url}#reg=${item.id}`} target="_blank" rel="noopener">
            Open on Walmart ↗
          </a>
        )}
      </td>
      <td>
        <input placeholder="Photo address (https://i5.walmartimages.com/…)" value={image} onChange={(e) => setImage(e.target.value.trim())} />
        <input placeholder="Product name (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      </td>
      <td style={{ width: 90 }}>
        <button
          className="btn btn-brown"
          disabled={!dirty}
          onClick={async () => {
            await onSave({ [item.id]: { image, title } });
            setSaved(true);
          }}
        >
          {saved && !dirty ? "Saved" : "Save"}
        </button>
      </td>
    </tr>
  );
}
