import { NextResponse } from "next/server";
import { getLog, getState, hasDatabase, releaseItem, resetAll } from "../../../lib/store";

export const dynamic = "force-dynamic";

function authorized(key) {
  const expected = process.env.ADMIN_KEY;
  return Boolean(expected) && key === expected;
}

export async function GET(req) {
  const key = req.headers.get("x-admin-key");
  if (!authorized(key)) return NextResponse.json({ error: "Wrong key" }, { status: 401 });
  const [{ claims, counts }, log] = await Promise.all([getState(), getLog()]);
  for (const c of Object.values(claims)) delete c.token;
  return NextResponse.json({ claims, counts, log, hasDatabase }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req) {
  const key = req.headers.get("x-admin-key");
  if (!authorized(key)) return NextResponse.json({ error: "Wrong key" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body.action === "release" && body.id) await releaseItem(String(body.id));
  else if (body.action === "reset" && body.confirm === "RESET") await resetAll();
  else return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
