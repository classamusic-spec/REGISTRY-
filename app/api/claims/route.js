import { NextResponse } from "next/server";
import { canSave, claimItem, countItem, getClaim, getState, releaseItem } from "../../../lib/store";
import { itemsById } from "../../../lib/registry";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const clean = (s, max) => String(s || "").trim().slice(0, max);

// Public view: which items are taken, never who bought them.
export async function GET() {
  const { claims, counts, meta } = await getState();
  const taken = Object.fromEntries(Object.entries(claims).map(([id, c]) => [id, { at: c.at }]));
  return NextResponse.json({ taken, counts, meta }, { headers: noStore });
}

export async function POST(req) {
  if (!canSave) {
    return NextResponse.json({ error: "The registry is still being set up — please try again a little later." }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const item = itemsById[body.id];
  if (!item) return NextResponse.json({ error: "Unknown item" }, { status: 404 });

  const record = { name: clean(body.name, 80), note: clean(body.note, 300), at: new Date().toISOString() };

  if (item.multi) {
    const count = await countItem(item.id, record);
    return NextResponse.json({ ok: true, count }, { headers: noStore });
  }

  const token = crypto.randomUUID();
  const ok = await claimItem(item.id, { ...record, token });
  if (!ok) {
    return NextResponse.json({ error: "Someone already bought this one" }, { status: 409, headers: noStore });
  }
  return NextResponse.json({ ok: true, token }, { headers: noStore });
}

// Lets a guest undo their own mark (they hold the token from POST).
export async function DELETE(req) {
  const body = await req.json().catch(() => ({}));
  const claim = await getClaim(String(body.id || ""));
  if (!claim || !body.token || claim.token !== body.token) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  await releaseItem(body.id);
  return NextResponse.json({ ok: true }, { headers: noStore });
}
