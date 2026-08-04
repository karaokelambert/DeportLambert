import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";

const router: IRouter = Router();

// Ensure table exists on first use
const ensureTable = pool.query(`
  CREATE TABLE IF NOT EXISTS jlsports_store (
    path TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb
  )
`).catch((err) => console.error("Table init error:", err));

// Helper: read current top-level doc for a path key
async function getDoc(key: string): Promise<Record<string, unknown>> {
  await ensureTable;
  const r = await pool.query(
    "SELECT data FROM jlsports_store WHERE path = $1",
    [key]
  );
  return (r.rows[0]?.data as Record<string, unknown>) ?? {};
}

// Helper: deep-set a value at a sub-path within an object
function deepSet(
  obj: Record<string, unknown>,
  parts: string[],
  value: unknown
): Record<string, unknown> {
  if (parts.length === 0) return (value as Record<string, unknown>) ?? {};
  const clone = { ...obj };
  const [head, ...tail] = parts;
  if (tail.length === 0) {
    if (value === null || value === undefined) {
      delete clone[head];
    } else {
      clone[head] = value;
    }
  } else {
    const child =
      clone[head] && typeof clone[head] === "object"
        ? ({ ...(clone[head] as Record<string, unknown>) })
        : {};
    clone[head] = deepSet(child, tail, value);
  }
  return clone;
}

// Upsert a top-level doc
async function upsertDoc(
  key: string,
  doc: Record<string, unknown>
): Promise<void> {
  await pool.query(
    `INSERT INTO jlsports_store (path, data) VALUES ($1, $2)
     ON CONFLICT (path) DO UPDATE SET data = $2`,
    [key, JSON.stringify(doc)]
  );
}

// ── GET /api/db/dump ── Return entire database as nested object
router.get("/dump", async (_req, res) => {
  await ensureTable;
  const rows = await pool.query("SELECT path, data FROM jlsports_store");
  const result: Record<string, unknown> = {};
  for (const row of rows.rows) {
    result[row.path as string] = row.data;
  }
  res.json(result);
});

// ── PUT /api/db/set ── Set value at a path
// Body: { path: "disciplina1/equipos/abc", value: {...} }
router.put("/set", async (req, res) => {
  const { path, value } = req.body as { path: string; value: unknown };

  if (path === "" || path === undefined || path === null) {
    // Root set: replace all top-level keys
    if (value && typeof value === "object") {
      for (const [key, val] of Object.entries(
        value as Record<string, unknown>
      )) {
        await upsertDoc(key, val as Record<string, unknown>);
      }
    }
    return res.json({ ok: true });
  }

  const parts = path.split("/").filter(Boolean);
  const topKey = parts[0];
  const subPath = parts.slice(1);

  if (subPath.length === 0) {
    // Setting the entire top-level key
    if (value === null) {
      await pool.query("DELETE FROM jlsports_store WHERE path = $1", [topKey]);
    } else {
      await upsertDoc(topKey, value as Record<string, unknown>);
    }
  } else {
    const doc = await getDoc(topKey);
    const updated = deepSet(doc, subPath, value);
    await upsertDoc(topKey, updated);
  }

  res.json({ ok: true });
});

// ── PUT /api/db/update ── Batch update multiple paths
// Body: { updates: { "disciplina1/equipos/abc": {...}, "config/disciplinas/d1": {...} } }
router.put("/update", async (req, res) => {
  const { updates } = req.body as { updates: Record<string, unknown> };
  if (!updates || typeof updates !== "object") {
    return res.status(400).json({ error: "updates object required" });
  }

  // Group updates by top-level key so we only do one upsert per key
  const byKey = new Map<string, Array<{ sub: string[]; value: unknown }>>();
  for (const [path, value] of Object.entries(updates)) {
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) continue;
    const key = parts[0];
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push({ sub: parts.slice(1), value });
  }

  for (const [key, ops] of byKey.entries()) {
    let doc = await getDoc(key);
    for (const { sub, value } of ops) {
      doc = sub.length === 0
        ? ((value as Record<string, unknown>) ?? {})
        : deepSet(doc, sub, value);
    }
    await upsertDoc(key, doc);
  }

  res.json({ ok: true });
});

// ── DELETE /api/db/del?path=disciplina1/equipos/abc ── Delete a path
router.delete("/del", async (req, res) => {
  const path = req.query.path as string;
  if (!path) return res.status(400).json({ error: "path required" });

  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) {
    // Clear entire DB
    await pool.query("DELETE FROM jlsports_store");
    return res.json({ ok: true });
  }

  const topKey = parts[0];
  const subPath = parts.slice(1);

  if (subPath.length === 0) {
    await pool.query("DELETE FROM jlsports_store WHERE path = $1", [topKey]);
  } else {
    const doc = await getDoc(topKey);
    const updated = deepSet(doc, subPath, null);
    await upsertDoc(topKey, updated);
  }

  res.json({ ok: true });
});

export default router;
