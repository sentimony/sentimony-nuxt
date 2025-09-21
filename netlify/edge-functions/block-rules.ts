export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname; // перевіряємо лише шлях (без query)

  // .php у path або згадки wp-, wp/, wordpress у path
  const bad =
    /\.php(?:$|[/?#])/i.test(path) ||
    /(wp-|wp\/|wordpress)/i.test(path);

  if (!bad) return; // пропускаємо нормальні запити

  // IP клієнта з Edge заголовка (fallback на X-Forwarded-For)
  const ip =
    request.headers.get("x-nf-client-connection-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown";

  // лог: "95.67.123.29 => /wp" (IP і "=>" сірим, шлях червоним)
  const gray = "\x1b[90m", red = "\x1b[31m", reset = "\x1b[0m";
  console.log(`${gray}${ip} => ${reset}${red}${url.pathname}${reset}`);

  const html = /* html */ `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Not found (404)</title>
  <style>
    :root { --bg:#052e16; --fg:#e7e7ea; --muted:#9aa0a6; --card:#141416; --accent:#ff4d4f; }
    @media (prefers-color-scheme: light) {
      :root { --bg:#fafafa; --fg:#1f1f21; --muted:#5f6368; --card:#ffffff; --accent:#d93025; }
    }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.5 system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji"; }
    .wrap { min-height:100dvh; display:grid; place-items:center; padding:24px; }
    .card { width:100%; max-width:720px; background:var(--card); border-radius:16px; padding:28px; box-shadow:0 6px 30px rgba(0,0,0,.15); }
    .code { display:inline-grid; place-items:center; width:44px; height:44px; border-radius:12px; background:rgba(255,77,79,.15); color:var(--accent); font-weight:700; margin-bottom:12px; }
    h1 { margin:8px 0 4px; font-size:24px; letter-spacing:.2px; }
    p { margin:6px 0 0; color:var(--muted); }
    .meta { margin-top:16px; padding-top:16px; border-top:1px solid rgba(127,127,127,.15); font-size:13px; color:var(--muted); word-break:break-all; }
    .meta b { color:var(--fg); }
    .actions { margin-top:20px; display:flex; gap:12px; flex-wrap:wrap; }
    .btn { appearance:none; border:0; padding:10px 14px; border-radius:10px; text-decoration:none; font-weight:600; background:#2b2c2f; color:var(--fg); }
    @media (prefers-color-scheme: light) { .btn { background:#f3f4f6; } }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="card" role="alert" aria-live="polite">
      <div class="code">404</div>
      <h1>Not found</h1>
      <p>The resource you requested does not exist.</p>
      <div class="meta">
        <div><b>Path:</b> ${escapeHtml(url.pathname)}</div>
      </div>
      <div class="actions">
        <a class="btn" href="/">Go to homepage</a>
      </div>
    </section>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "X-Edge-Block": "scan"
    }
  });
};

// базовий ескейп для виводу URL у HTML
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}
