/**
 * Tracker — Core Logic Unit Tests
 * Run: node tests/core.test.js
 * No external dependencies required.
 */

let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    console.log(`     → ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "Assertion failed");
}

function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

function assertDeepEqual(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b))
    throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// ── Helpers extracted from app ────────────────────────────

function esc(s) {
  return (s || "").replace(/[&<>"']/g, c =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])
  );
}

function parseDate(v) {
  if (!v) return "";
  v = v.trim();
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const eu = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(v);
  if (eu) return `${eu[3]}-${eu[2].padStart(2,"0")}-${eu[1].padStart(2,"0")}`;
  const sl = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (sl) return `${sl[3]}-${sl[2].padStart(2,"0")}-${sl[1].padStart(2,"0")}`;
  return "";
}

function toEuDate(iso) {
  if (!iso) return "";
  const p = iso.split("-");
  if (p.length !== 3) return iso;
  return `${p[2]}.${p[1]}.${p[0]}`;
}

function mergeCompanies(local, remote) {
  const map = new Map();
  (local || []).forEach(c => map.set(c.id, c));
  (remote || []).forEach(rc => {
    const lc = map.get(rc.id);
    if (!lc) { map.set(rc.id, rc); return; }
    const lt = lc.updatedAt || 0, rt = rc.updatedAt || 0;
    if (rt > lt) map.set(rc.id, rc);
  });
  return Array.from(map.values());
}

function locationMatches(address, loc) {
  if (!loc || !loc.trim()) return true;
  if (!address || !address.trim()) return false;
  const locWords = loc.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2);
  const addrLower = address.toLowerCase();
  if (!locWords.length) return true;
  return locWords.some(w => addrLower.includes(w));
}

function daysDiff(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate), now = new Date();
  now.setHours(0,0,0,0); d.setHours(0,0,0,0);
  return Math.round((d - now) / (1000 * 60 * 60 * 24));
}

function uid() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const VALID_STATUSES = ["not_sent","sent","response","interview","accepted","rejected"];

function sanitizeImport(arr) {
  if (!Array.isArray(arr)) throw new Error("invalid format");
  if (arr.length > 500) throw new Error("too many entries (max 500)");
  return arr
    .filter(c => c && typeof c === "object" && typeof c.name === "string" && c.name.trim())
    .map(c => ({
      id: typeof c.id === "string" ? c.id : uid(),
      name: String(c.name || "").slice(0, 200),
      status: VALID_STATUSES.includes(c.status) ? c.status : "not_sent",
      sentDate: typeof c.sentDate === "string" ? c.sentDate.slice(0, 10) : "",
      profession: String(c.profession || "").slice(0, 100),
      priority: ["A","B","C",""].includes(c.priority) ? c.priority : "",
      noPosition: !!c.noPosition,
      archived: !!c.archived,
      updatedAt: typeof c.updatedAt === "number" ? c.updatedAt : Date.now(),
      notes: String(c.notes || "").slice(0, 2000),
    }));
}

// ── Test suites ───────────────────────────────────────────

console.log("\n📋 esc() — XSS prevention");
test("escapes ampersand", () => assertEqual(esc("a & b"), "a &amp; b"));
test("escapes less-than", () => assertEqual(esc("<script>"), "&lt;script&gt;"));
test("escapes greater-than", () => assertEqual(esc("a > b"), "a &gt; b"));
test("escapes double quote", () => assertEqual(esc('"hello"'), "&quot;hello&quot;"));
test("escapes single quote", () => assertEqual(esc("it's"), "it&#39;s"));
test("handles null/undefined", () => assertEqual(esc(null), ""));
test("handles empty string", () => assertEqual(esc(""), ""));
test("leaves safe string unchanged", () => assertEqual(esc("Hello World 123"), "Hello World 123"));
test("blocks script injection", () => {
  const input = '<script>alert("xss")</script>';
  const out = esc(input);
  assert(!out.includes("<script>"), "must not contain <script>");
  assert(!out.includes("</script>"), "must not contain </script>");
});

console.log("\n📅 parseDate() — date parsing");
test("ISO format passthrough", () => assertEqual(parseDate("2026-01-15"), "2026-01-15"));
test("European DD.MM.YYYY", () => assertEqual(parseDate("15.01.2026"), "2026-01-15"));
test("European D.M.YYYY single digits", () => assertEqual(parseDate("5.1.2026"), "2026-01-05"));
test("Slash DD/MM/YYYY", () => assertEqual(parseDate("15/01/2026"), "2026-01-15"));
test("empty string returns empty", () => assertEqual(parseDate(""), ""));
test("null returns empty", () => assertEqual(parseDate(null), ""));
test("invalid format returns empty", () => assertEqual(parseDate("not-a-date"), ""));
test("whitespace trimmed", () => assertEqual(parseDate("  2026-06-15  "), "2026-06-15"));

console.log("\n📅 toEuDate() — display formatting");
test("ISO to European", () => assertEqual(toEuDate("2026-01-15"), "15.01.2026"));
test("empty string", () => assertEqual(toEuDate(""), ""));
test("null returns empty", () => assertEqual(toEuDate(null), ""));

console.log("\n🔀 mergeCompanies() — Gist sync merge");
test("remote-only entry is added", () => {
  const local = [{ id: "a", name: "A", updatedAt: 100 }];
  const remote = [{ id: "b", name: "B", updatedAt: 200 }];
  const merged = mergeCompanies(local, remote);
  assertEqual(merged.length, 2);
});
test("local-only entry is kept", () => {
  const local = [{ id: "a", name: "A", updatedAt: 100 }];
  const merged = mergeCompanies(local, []);
  assertEqual(merged.length, 1);
  assertEqual(merged[0].name, "A");
});
test("newer remote wins on conflict", () => {
  const local = [{ id: "x", name: "Old", updatedAt: 100 }];
  const remote = [{ id: "x", name: "New", updatedAt: 999 }];
  const merged = mergeCompanies(local, remote);
  assertEqual(merged.length, 1);
  assertEqual(merged[0].name, "New");
});
test("newer local wins on conflict", () => {
  const local = [{ id: "x", name: "Local", updatedAt: 999 }];
  const remote = [{ id: "x", name: "Remote", updatedAt: 100 }];
  const merged = mergeCompanies(local, remote);
  assertEqual(merged.length, 1);
  assertEqual(merged[0].name, "Local");
});
test("empty local + remote returns remote", () => {
  const remote = [{ id: "a", name: "A", updatedAt: 1 }];
  const merged = mergeCompanies([], remote);
  assertEqual(merged.length, 1);
});
test("both empty returns empty", () => {
  assertEqual(mergeCompanies([], []).length, 0);
});
test("no duplicates on same id", () => {
  const c = { id: "x", name: "X", updatedAt: 1 };
  const merged = mergeCompanies([c], [c]);
  assertEqual(merged.length, 1);
});

console.log("\n📍 locationMatches() — discovery address validation");
test("empty loc always matches", () => assert(locationMatches("Wien, Austria", "")));
test("empty address fails when loc given", () => assert(!locationMatches("", "Wien")));
test("exact city match", () => assert(locationMatches("Koppstraße 1, Wien, Austria", "Wien")));
test("case insensitive", () => assert(locationMatches("vienna, austria", "Vienna")));
test("wrong city fails", () => assert(!locationMatches("München, Germany", "Wien")));
test("null address fails", () => assert(!locationMatches(null, "Wien")));
test("country match", () => assert(locationMatches("Zürich, Switzerland", "Switzerland")));
test("partial word match", () => assert(locationMatches("Donaustadt, Wien, Austria", "Donaustadt")));

console.log("\n📦 sanitizeImport() — import validation");
test("valid array passes", () => {
  const result = sanitizeImport([{ name: "Test GmbH", status: "sent" }]);
  assertEqual(result.length, 1);
  assertEqual(result[0].name, "Test GmbH");
  assertEqual(result[0].status, "sent");
});
test("invalid status normalized to not_sent", () => {
  const result = sanitizeImport([{ name: "X", status: "hacked" }]);
  assertEqual(result[0].status, "not_sent");
});
test("non-array throws", () => {
  let threw = false;
  try { sanitizeImport({ name: "X" }); } catch(e) { threw = true; }
  assert(threw, "should throw on non-array");
});
test("entries over 500 throws", () => {
  let threw = false;
  try { sanitizeImport(new Array(501).fill({ name: "X" })); } catch(e) { threw = true; }
  assert(threw, "should throw on >500 entries");
});
test("entries without name are filtered out", () => {
  const result = sanitizeImport([{ name: "" }, { name: "Valid" }]);
  assertEqual(result.length, 1);
  assertEqual(result[0].name, "Valid");
});
test("name truncated at 200 chars", () => {
  const long = "A".repeat(300);
  const result = sanitizeImport([{ name: long }]);
  assertEqual(result[0].name.length, 200);
});
test("notes truncated at 2000 chars", () => {
  const result = sanitizeImport([{ name: "X", notes: "N".repeat(3000) }]);
  assertEqual(result[0].notes.length, 2000);
});
test("noPosition coerced to boolean", () => {
  const r1 = sanitizeImport([{ name: "X", noPosition: 1 }]);
  const r2 = sanitizeImport([{ name: "X", noPosition: 0 }]);
  assertEqual(r1[0].noPosition, true);
  assertEqual(r2[0].noPosition, false);
});
test("XSS in name is passed through (esc() applied at render time)", () => {
  // sanitizeImport stores raw — esc() is applied when rendering to DOM
  const result = sanitizeImport([{ name: '<script>alert(1)</script>' }]);
  assertEqual(result[0].name, '<script>alert(1)</script>');
  // And esc() must neutralise it:
  assert(!esc(result[0].name).includes("<script>"), "esc() must block XSS");
});

console.log("\n🆔 uid() — unique ID generation");
test("starts with 'c'", () => assert(uid().startsWith("c")));
test("generates unique IDs", () => {
  const ids = new Set(Array.from({length: 100}, uid));
  assertEqual(ids.size, 100, "all 100 IDs must be unique");
});

// ── Summary ───────────────────────────────────────────────
console.log(`\n${"─".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("❌ Some tests failed.");
  process.exit(1);
} else {
  console.log("✅ All tests passed.");
}
