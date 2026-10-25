import { NextResponse } from "next/server";
import { canSave, claimItem, countItem, getLog, getState, hasDatabase, releaseItem, resetAll, saveMeta } from "../../../lib/store";
import { itemsById } from "../../../lib/registry";

export const dynamic = "force-dynamic";

function authorized(key) {
  const expected = process.env.ADMIN_KEY;
  return Boolean(expected) && key === expected;
}

export async function GET(req) {
  const key = req.headers.get("x-admin-key");
  if (!authorized(key)) return NextResponse.json({ error: "Wrong key" }, { status: 401 });
  const [{ claims, counts, meta }, log] = await Promise.all([getState(), getLog()]);
  for (const c of Object.values(claims)) delete c.token;
  return NextResponse.json({ claims, counts, meta, log, hasDatabase }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req) {
  const key = req.headers.get("x-admin-key");
  if (!authorized(key)) return NextResponse.json({ error: "Wrong key" }, { status: 401 });
  if (!canSave) return NextResponse.json({ error: "Connect Upstash Redis first" }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  if (body.action === "claim") {
    // The host marks a gift as bought, e.g. a guest who forgot to tap "Yes, I bought it".
    const item = itemsById[body.id];
    if (!item) return NextResponse.json({ error: "Unknown item" }, { status: 404 });
    const clean = (s, max) => String(s || "").trim().slice(0, max);
    const record = { name: clean(body.name, 80), note: clean(body.note, 300), at: new Date().toISOString(), byHost: true };
    if (item.multi) return NextResponse.json({ ok: true, count: await countItem(item.id, record) });
    const ok = await claimItem(item.id, record);
    if (!ok) return NextResponse.json({ error: "Already marked as purchased" }, { status: 409 });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "release" && body.id) await releaseItem(String(body.id));
  else if (body.action === "reset" && body.confirm === "RESET") await resetAll();
  else if (body.action === "meta" && body.entries && typeof body.entries === "object") {
    const entries = {};
    for (const [id, v] of Object.entries(body.entries)) {
      if (!itemsById[id] || !v) continue;
      const e = {};
      if (typeof v.title === "string" && v.title.trim()) e.title = v.title.trim().slice(0, 200);
      if (typeof v.image === "string" && /^https:\/\//.test(v.image)) e.image = v.image.slice(0, 1000);
      else if (v.image === "") e.image = ""; // host cleared a wrong photo
      if (typeof v.price === "string") {
        const n = Number(v.price.replace(/[$,\s]/g, ""));
        if (v.price.trim() === "") e.price = ""; // cleared
        else if (Number.isFinite(n) && n > 0 && n < 100000) e.price = "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      if (Object.keys(e).length) entries[id] = e;
    }
    return NextResponse.json({ ok: true, saved: await saveMeta(entries) });
  }
  else return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
