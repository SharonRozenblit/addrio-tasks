// Firebase layer: Google sign-in and two-way sync between Firestore and the
// in-memory state that index.html renders (U, DRAFTS, IDEAS, MSGS, AREAS, SPRINT, SEEN).
// Each record is stored as one JSON string (`j`), because Firestore can't hold nested arrays.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, onSnapshot, setDoc, deleteDoc, getDocFromServer, writeBatch } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { SEED } from "./seed.js";

const app = initializeApp({
  apiKey: "AIzaSyCb4ZtdEWrQEy-HTElZ3jM6QwWpe0Yr4qU",
  authDomain: "addrio-tasks.firebaseapp.com",
  projectId: "addrio-tasks",
  storageBucket: "addrio-tasks.firebasestorage.app",
  messagingSenderId: "234296584948",
  appId: "1:234296584948:web:1ea8db8a12894ff1cb0ca1"
});
const auth = getAuth(app);
let db;
try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); }
catch (e) { db = initializeFirestore(app, {}); }

const last = { units: new Map(), drafts: new Map(), ideas: new Map(), msgs: new Map(), areas: "", sprint: "", seen: "" };
let unsubs = [];
const J = o => JSON.stringify(o);

const LISTS = {
  units:  { get: () => U,      set: v => { U = v },      id: x => x.code, dir: 1 },
  drafts: { get: () => DRAFTS, set: v => { DRAFTS = v }, id: x => x.id,   dir: -1 },
  ideas:  { get: () => IDEAS,  set: v => { IDEAS = v },  id: x => x.id,   dir: -1 }
};

function report(err) {
  console.error(err);
  toast(err && err.code === "permission-denied" ? "אין הרשאה לשינוי הזה" : "השמירה נכשלה. בודקים חיבור לאינטרנט");
}

function sync() {
  if (!me) return;
  const admin = can(), isHub = hub();
  let seq = Date.now();
  for (const [name, L] of Object.entries(LISTS)) {
    const seen = new Set();
    for (const x of L.get()) {
      const id = L.id(x); seen.add(id);
      if (x.n == null) x.n = seq++;
      const j = J(x);
      if (last[name].get(id) === j) continue;
      last[name].set(id, j);
      const data = { j, n: x.n };
      if (name === "units") { data.status = x.status || ""; data.owner = x.owner || ""; }
      setDoc(doc(db, name, id), data).catch(report);
    }
    if (admin) for (const id of [...last[name].keys()]) if (!seen.has(id)) { last[name].delete(id); deleteDoc(doc(db, name, id)).catch(report); }
  }
  for (const k of (isHub ? Object.keys(MSGS) : [me])) {
    const j = J(MSGS[k] || []);
    if (last.msgs.get(k) === j) continue;
    last.msgs.set(k, j);
    setDoc(doc(db, "msgs", k), { j }).catch(report);
  }
  const a = J(AREAS);
  if (a !== last.areas) { last.areas = a; setDoc(doc(db, "meta", "areas"), { j: a }).catch(report); }
  if (admin) {
    const sp = J(SPRINT);
    if (sp !== last.sprint) { last.sprint = sp; setDoc(doc(db, "meta", "sprint"), { j: sp }).catch(report); }
  }
}

function saveSeen() {
  if (!me) return;
  const j = J(SEEN);
  if (j === last.seen) return;
  last.seen = j;
  setDoc(doc(db, "users", me), { j }).catch(report);
}

function closeSprint(summary) {
  setDoc(doc(db, "sprints", String(summary.n)), { j: J(summary), closedAt: summary.closedAt }).catch(report);
}

async function seedIfEmpty() {
  const snap = await getDocFromServer(doc(db, "meta", "sprint"));
  if (snap.exists()) return;
  const b = writeBatch(db);
  for (const u of SEED.units) b.set(doc(db, "units", u.code), { j: J(u), n: u.n, status: u.status || "", owner: u.owner || "" });
  b.set(doc(db, "meta", "areas"), { j: J(SEED.areas) });
  b.set(doc(db, "meta", "sprint"), { j: J(SEED.sprint) });
  for (const k of ["liam", "yovel", "ido"]) b.set(doc(db, "msgs", k), { j: "[]" });
  await b.commit();
}

function listen() {
  const need = new Set(["units", "drafts", "ideas", "msgs", "areas", "sprint", "seen"]);
  const got = name => { if (need.delete(name) && !need.size) { READY = true; render(); } else if (READY) onRemote(); };
  const fail = name => err => { console.error(name, err); toast("אין גישה לנתונים. ייתכן שכללי האבטחה עוד לא פורסמו"); got(name); };

  for (const [name, L] of Object.entries(LISTS)) {
    unsubs.push(onSnapshot(collection(db, name), qs => {
      const rows = qs.docs.map(d => { const x = JSON.parse(d.data().j); return x; });
      rows.sort((a, b) => ((a.n || 0) - (b.n || 0)) * L.dir);
      last[name] = new Map(qs.docs.map(d => [d.id, d.data().j]));
      // the parsed objects round-trip to the same JSON as what we stored, so no echo writes
      for (const x of rows) last[name].set(L.id(x), J(x));
      L.set(rows);
      got(name);
    }, fail(name)));
  }
  const onMsgDoc = d => { const v = d.exists() ? JSON.parse(d.data().j) : []; MSGS[d.id] = v; last.msgs.set(d.id, J(v)); };
  if (hub()) unsubs.push(onSnapshot(collection(db, "msgs"), qs => { qs.docs.forEach(onMsgDoc); got("msgs"); }, fail("msgs")));
  else unsubs.push(onSnapshot(doc(db, "msgs", me), d => { onMsgDoc(d); got("msgs"); }, fail("msgs")));

  unsubs.push(onSnapshot(doc(db, "meta", "areas"), d => {
    if (d.exists()) { AREAS = JSON.parse(d.data().j); last.areas = J(AREAS); }
    got("areas");
  }, fail("areas")));
  unsubs.push(onSnapshot(doc(db, "meta", "sprint"), d => {
    if (d.exists()) { SPRINT = JSON.parse(d.data().j); last.sprint = J(SPRINT); }
    got("sprint");
  }, fail("sprint")));
  unsubs.push(onSnapshot(doc(db, "users", me), d => {
    if (d.exists()) { SEEN = { u: {}, ideas: "", msg: {}, ...JSON.parse(d.data().j) }; last.seen = J(SEEN); }
    else if (!last.seen) {
      // first visit: everything that already exists counts as read
      const t = now(); SEEN = { u: Object.fromEntries(U.map(u => [u.code, t])), ideas: t, msg: { liam: t, yovel: t, ido: t, sharon: t } };
      saveSeen();
    }
    got("seen");
  }, fail("seen")));
}

function reset() {
  unsubs.forEach(f => f()); unsubs = [];
  for (const k of ["units", "drafts", "ideas", "msgs"]) last[k] = new Map();
  last.areas = last.sprint = last.seen = "";
  U = []; DRAFTS = []; IDEAS = []; MSGS = { liam: [], yovel: [], ido: [] }; SEEN = { u: {}, ideas: "", msg: {} };
  READY = false; me = null; openCode = null;
}

async function signIn() {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account" });
  try { await signInWithPopup(auth, p); }
  catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") return signInWithRedirect(auth, p);
    if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") return;
    AUTHERR = e.code === "auth/unauthorized-domain"
      ? "הכתובת של האתר עוד לא אושרה ב-Firebase (Authorized domains)."
      : "ההתחברות לא הצליחה (" + (e.code || e.message) + ").";
    render();
  }
}

window.FB = { pending: true, signIn, signOut: () => { reset(); return signOut(auth); }, sync, saveSeen, closeSprint };
render();

getRedirectResult(auth).catch(e => { AUTHERR = "ההתחברות לא הצליחה (" + (e.code || e.message) + ")."; });

onAuthStateChanged(auth, async user => {
  FB.pending = false;
  if (!user) { reset(); render(); return; }
  const k = keyOf(user.email);
  if (!k || !user.emailVerified) {
    AUTHERR = `החשבון ${user.email} לא ברשימת המורשים. אפשר לבקש משרון להוסיף אותו.`;
    reset(); await signOut(auth); render(); return;
  }
  AUTHERR = ""; me = k; view = "mine"; render();
  if (can()) { try { await seedIfEmpty(); } catch (e) { console.error("seed", e); } }
  listen();
});
