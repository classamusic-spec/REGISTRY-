import { Redis } from "@upstash/redis";

// Purchases live in Redis so every guest sees the same state.
// On Vercel, add the Upstash Redis integration (Storage tab) — it injects
// KV_REST_API_URL / KV_REST_API_TOKEN automatically.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

export const hasDatabase = Boolean(redis);

const CLAIMS = "registry:claims"; // hash: itemId -> JSON {name, note, at, token}
const COUNTS = "registry:counts"; // hash: itemId -> times bought (multi items)
const LOG = "registry:log"; //       list of every purchase, for the host

// In-memory fallback for local development only (not shared, not persistent).
const mem = globalThis.__registryMem || (globalThis.__registryMem = { claims: {}, counts: {}, log: [] });

const parse = (v) => (typeof v === "string" ? JSON.parse(v) : v);

export async function getState() {
  if (!redis) return { claims: { ...mem.claims }, counts: { ...mem.counts } };
  const [claims, counts] = await Promise.all([redis.hgetall(CLAIMS), redis.hgetall(COUNTS)]);
  const out = {};
  for (const [id, v] of Object.entries(claims || {})) out[id] = parse(v);
  const c = {};
  for (const [id, v] of Object.entries(counts || {})) c[id] = Number(v);
  return { claims: out, counts: c };
}

// Returns true if this guest got it, false if someone already bought it.
export async function claimItem(id, record) {
  const value = JSON.stringify(record);
  if (!redis) {
    if (mem.claims[id]) return false;
    mem.claims[id] = record;
    mem.log.push({ id, ...record, token: undefined });
    return true;
  }
  const ok = await redis.hsetnx(CLAIMS, id, value); // atomic: first buyer wins
  const { token: _secret, ...shown } = record;
  if (ok) await redis.rpush(LOG, JSON.stringify({ id, ...shown }));
  return ok === 1 || ok === true;
}

export async function countItem(id, record) {
  if (!redis) {
    mem.counts[id] = (mem.counts[id] || 0) + 1;
    mem.log.push({ id, ...record });
    return mem.counts[id];
  }
  const n = await redis.hincrby(COUNTS, id, 1);
  await redis.rpush(LOG, JSON.stringify({ id, ...record }));
  return n;
}

export async function getClaim(id) {
  if (!redis) return mem.claims[id] || null;
  const v = await redis.hget(CLAIMS, id);
  return v ? parse(v) : null;
}

export async function releaseItem(id) {
  if (!redis) {
    delete mem.claims[id];
    return;
  }
  await redis.hdel(CLAIMS, id);
}

export async function getLog() {
  if (!redis) return [...mem.log];
  const rows = await redis.lrange(LOG, 0, -1);
  return rows.map(parse);
}

export async function resetAll() {
  if (!redis) {
    mem.claims = {};
    mem.counts = {};
    mem.log = [];
    return;
  }
  await redis.del(CLAIMS, COUNTS, LOG);
}
