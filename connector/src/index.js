// Addrio Tasks read-only connector for Claude and ChatGPT (MCP over streamable HTTP).
//
// Sign-in: the MCP client is sent through Google. The Google ID token is exchanged for a
// Firebase ID token, and every Firestore read is made with that token, so the security
// rules already published for the site decide what each person can see. No master key
// is stored here, and the connector exposes no write operations.
import { PEOPLE, TOOLS, NOTE, runTool } from "./tools.js";
import { OAuthProvider, AuthorizationError, CimdFetchError, OAuthError, authorizationErrorRedirect } from "@cloudflare/workers-oauth-provider";

const FIREBASE_API_KEY = "AIzaSyCb4ZtdEWrQEy-HTElZ3jM6QwWpe0Yr4qU"; // public web key, same as the site
const PROJECT = "addrio-tasks";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

/* ---------------- Google + Firebase ---------------- */

async function s256(v) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return btoa(String.fromCharCode(...new Uint8Array(h))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function firebaseFromGoogle(idToken) {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postBody: `id_token=${idToken}&providerId=google.com`, requestUri: "http://localhost", returnSecureToken: true, returnIdpCredential: true })
  });
  const j = await r.json();
  if (!r.ok) throw new Error("firebase sign-in failed: " + (j.error?.message || r.status));
  return { idToken: j.idToken, refreshToken: j.refreshToken, exp: Date.now() + (+j.expiresIn - 120) * 1000, email: String(j.email || "").toLowerCase(), verified: j.emailVerified };
}

async function refreshFirebase(refreshToken) {
  const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken })
  });
  const j = await r.json();
  if (!r.ok) {
    const bad = ["TOKEN_EXPIRED", "USER_DISABLED", "USER_NOT_FOUND", "INVALID_REFRESH_TOKEN"].includes(j.error?.message);
    throw new OAuthError(bad ? "invalid_grant" : "temporarily_unavailable", { description: "Firebase: " + (j.error?.message || r.status), statusCode: bad ? 400 : 503 });
  }
  return { idToken: j.id_token, refreshToken: j.refresh_token, exp: Date.now() + (+j.expires_in - 120) * 1000 };
}

/* ---------------- Firestore (as the signed-in user) ---------------- */

const fsBase = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
async function fsGet(path, token) {
  const r = await fetch(`${fsBase}/${path}${path.includes("/") ? "" : "?pageSize=1000"}`, { headers: { Authorization: `Bearer ${token}` } });
  if (r.status === 404) return null;
  const j = await r.json();
  if (!r.ok) throw new Error(`Firestore ${path}: ${j.error?.status || r.status}`);
  return j;
}
const parseDoc = d => JSON.parse(d.fields?.j?.stringValue || "null");
async function loadAll(token) {
  const [units, ideas, drafts, areas, sprint] = await Promise.all([
    fsGet("units", token), fsGet("ideas", token), fsGet("drafts", token), fsGet("meta/areas", token), fsGet("meta/sprint", token)
  ]);
  const list = c => (c?.documents || []).map(parseDoc).filter(Boolean).sort((a, b) => (a.n || 0) - (b.n || 0));
  return { U: list(units), IDEAS: list(ideas), DRAFTS: list(drafts), AREAS: areas ? parseDoc(areas) : {}, SPRINT: sprint ? parseDoc(sprint) : {} };
}

/* ---------------- MCP endpoint (stateless JSON-RPC) ---------------- */

const SUPPORTED = ["2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

async function firebaseToken(ctx) {
  const p = ctx.props;
  if (p.fb && p.fb.exp > Date.now()) return p.fb.idToken;
  const fresh = await refreshFirebase(p.fb.refreshToken); // access tokens are short-lived; refresh grant updates props
  p.fb = { ...p.fb, ...fresh };
  return fresh.idToken;
}

const McpHandler = {
  async fetch(request, env, ctx) {
    if (request.method === "GET") return new Response("Use POST", { status: 405, headers: { Allow: "POST" } });
    if (request.method === "DELETE") return new Response(null, { status: 204 });
    if (request.method !== "POST") return new Response(null, { status: 405 });
    let msg;
    try { msg = await request.json(); } catch { return rpcErr(null, -32700, "Parse error"); }
    const batch = Array.isArray(msg);
    const out = [];
    for (const m of batch ? msg : [msg]) { const r = await handle(m, ctx); if (r) out.push(r); }
    if (!out.length) return new Response(null, { status: 202 });
    return Response.json(batch ? out : out[0]);
  }
};
const rpcErr = (id, code, message) => Response.json({ jsonrpc: "2.0", id, error: { code, message } });

async function handle(m, ctx) {
  const ok = result => ({ jsonrpc: "2.0", id: m.id, result });
  if (m.id === undefined) return null; // notification
  switch (m.method) {
    case "initialize": {
      const v = SUPPORTED.includes(m.params?.protocolVersion) ? m.params.protocolVersion : SUPPORTED[2];
      return ok({ protocolVersion: v, capabilities: { tools: {} }, serverInfo: { name: "addrio-tasks", title: "Addrio Tasks", version: "1.0.0" },
        instructions: "Read-only access to Addrio's task tracker (Hebrew). Owners: sharon=שרון, liam=ליאם, yovel=יובל, ido=עידו. Use current_sprint for 'this week', list_units with owner for a person's work, get_unit for details." });
    }
    case "ping": return ok({});
    case "tools/list": return ok({ tools: TOOLS });
    case "tools/call": {
      try {
        const token = await firebaseToken(ctx);
        const D = await loadAll(token);
        const text = runTool(m.params?.name, m.params?.arguments || {}, D);
        return ok({ content: [{ type: "text", text: NOTE + "\n\n" + text }] });
      } catch (e) {
        return ok({ content: [{ type: "text", text: "Error: " + e.message }], isError: true });
      }
    }
    default: return { jsonrpc: "2.0", id: m.id, error: { code: -32601, message: "Method not found" } };
  }
}

/* ---------------- sign-in pages ---------------- */

const page = (title, body, status = 200, headers = new Headers()) => {
  headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(`<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>body{font-family:system-ui,Arial,sans-serif;background:#fbf6f2;color:#231c21;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px}
.c{background:#fff;border-radius:16px;box-shadow:0 4px 16px rgba(60,20,40,.08);padding:28px;max-width:420px;width:100%}h1{font-size:22px;margin:0 0 12px}p{line-height:1.6;color:#6f6169}
b{color:#231c21}.w{background:#fde4e8;color:#a3152c;padding:10px;border-radius:8px}button{font:inherit;border-radius:10px;padding:10px 18px;border:1px solid #e7dde3;background:#fff;cursor:pointer}
.p{background:linear-gradient(135deg,#ff347f,#ff47ae);color:#fff;border:0;font-weight:700}</style><div class="c">${body}</div></html>`, { status, headers });
};

async function authorizePage(req, env) {
  const oauth = env.OAUTH_PROVIDER;
  if (req.method === "GET") {
    const request = await oauth.parseAuthRequest(req);
    const d = await oauth.describeConsent(request);
    const consent = await oauth.beginConsent(request);
    return page("Addrio Tasks", `<h1>חיבור ל-Addrio Tasks</h1>
<p><b>${esc(d.clientName)}</b> מבקש גישת <b>קריאה בלבד</b> למשימות של Addrio, בשמך.</p>
<p>הגישה תישלח אל <b>${esc(d.redirectHost)}</b>.${d.clientDomain ? "" : " שם האפליקציה לא מאומת."}</p>
${d.redirectIsLoopback ? `<p class="w">הגישה נשלחת לאפליקציה במחשב שלך. המשך רק אם התחלת עכשיו להתחבר ממנה.</p>` : ""}
<p>בשלב הבא נכנסים עם חשבון ה-Google שמורשה באתר.</p>
<form method="post"><input type="hidden" name="handle" value="${esc(consent.handle)}">
<button class="p" name="decision" value="approve">המשך עם Google</button> <button name="decision" value="deny">ביטול</button></form>`, 200, consent.headers);
  }
  const form = await req.formData();
  const handle = String(form.get("handle"));
  if (form.get("decision") !== "approve") {
    const denied = await oauth.denyConsent(req, handle);
    return new Response(null, { status: 302, headers: denied.headers });
  }
  const approved = await oauth.approveConsent(req, handle);
  const verifier = crypto.randomUUID() + crypto.randomUUID();
  const { state, headers } = await oauth.beginUpstream(approved.request, { data: { verifier }, headers: approved.headers });
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.search = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: new URL("/callback", req.url).href, response_type: "code",
    scope: "openid email", state, code_challenge: await s256(verifier), code_challenge_method: "S256", prompt: "select_account" });
  headers.set("Location", u.href);
  return new Response(null, { status: 302, headers });
}

async function callback(req, env) {
  const oauth = env.OAUTH_PROVIDER;
  const { request: original, data, headers } = await oauth.finishUpstream(req);
  const url = new URL(req.url);
  const deny = () => { headers.set("Location", authorizationErrorRedirect(original, "access_denied")); return new Response(null, { status: 302, headers }); };
  if (url.searchParams.get("error")) return deny();
  const tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code: url.searchParams.get("code"), client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: new URL("/callback", req.url).href, grant_type: "authorization_code", code_verifier: data.verifier })
  });
  const tj = await tr.json();
  if (!tr.ok || !tj.id_token) return page("שגיאה", `<h1>ההתחברות ל-Google נכשלה</h1><p>${esc(tj.error_description || tj.error || tr.status)}</p>`, 502);
  const fb = await firebaseFromGoogle(tj.id_token);
  if (!PEOPLE[fb.email] || !fb.verified) {
    return page("אין הרשאה", `<h1>החשבון לא מורשה</h1><p>${esc(fb.email)} לא ברשימת המורשים של Addrio Tasks. סגרו את החלון ונסו עם החשבון הנכון.</p>`, 403);
  }
  const { redirectTo } = await oauth.completeAuthorization({
    request: original, userId: PEOPLE[fb.email][0], metadata: { email: fb.email }, scope: original.scope,
    props: { email: fb.email, fb }
  });
  headers.set("Location", redirectTo);
  return new Response(null, { status: 302, headers });
}

const DefaultHandler = {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    try {
      if (path === "/authorize") return await authorizePage(req, env);
      if (path === "/callback") return await callback(req, env);
      if (path === "/") return page("Addrio Tasks", `<h1>Addrio Tasks · מחבר</h1><p>מחבר קריאה בלבד ל-Claude ול-ChatGPT. כתובת המחבר:</p><p dir="ltr"><b>${esc(new URL("/mcp", req.url).href)}</b></p>`);
      return new Response("Not found", { status: 404 });
    } catch (e) {
      if (e instanceof AuthorizationError && e.redirectTo) return Response.redirect(e.redirectTo, 302);
      if (e instanceof AuthorizationError || e instanceof CimdFetchError) {
        return page("שגיאה", `<h1>משהו השתבש</h1><p>${esc(e instanceof AuthorizationError ? e.description : "לא ניתן לאמת את האפליקציה.")}</p><p>סגרו את החלון ונסו להתחבר שוב.</p>`, 400);
      }
      throw e;
    }
  }
};

/* ---------------- provider ---------------- */

let provider;
export default {
  fetch(req, env, ctx) {
    provider ||= new OAuthProvider({
      apiRoute: "/mcp",
      apiHandler: McpHandler,
      defaultHandler: DefaultHandler,
      authorizeEndpoint: "/authorize",
      tokenEndpoint: "/oauth/token",
      clientRegistrationEndpoint: "/oauth/register",
      scopesSupported: ["tasks:read", "offline_access"],
      resourceMetadata: { resource: new URL("/mcp", env.PUBLIC_URL).href, authorization_servers: [new URL(env.PUBLIC_URL).origin] },
      requiredScopes: ["tasks:read"],
      clientIdMetadataDocumentEnabled: true,
      refreshTokenIdleTTL: 60 * 24 * 3600,
      tokenExchangeCallback: async ({ grantType, props }) => {
        if (grantType !== "refresh_token" || !props?.fb) return;
        const fresh = await refreshFirebase(props.fb.refreshToken);
        const next = { ...props, fb: { ...props.fb, ...fresh } };
        return { accessTokenProps: next, newProps: next };
      }
    });
    return provider.fetch(req, env, ctx);
  }
};
