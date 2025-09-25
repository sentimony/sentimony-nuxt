export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname; // перевіряємо лише шлях (без query)

  // .php (з будь-чим після) у path або згадки wp-, wp/, wordpress у path
  const bad =
    /\.php/i.test(path) ||
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
  <title>404 · Sentimony Records</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: linear-gradient(to bottom right, #052e16, #064e2a, #065f32);
      color: white;
      // font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
      font-family: Montserrat, sans-serif;
      min-height: 100vh;
      font-weight: 100;
      // -webkit-font-smoothing: antialiased;
      // -moz-osx-font-smoothing: grayscale;
      // background-attachment: fixed;
      // background-color: rgb(5 46 22 / var(--tw-bg-opacity, 1));
      // background-image: url(https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?01);
      // background-position: 50%;
      // background-repeat: no-repeat;
      // background-size: cover;
    }
    .container {
      max-width: 384px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 0 auto;
      padding: 0 8px;
      text-align: center;
    }
    .status-code {
      font-size: 2.25rem;
      margin: 1.5rem 0;
    }
    .message {
      margin-bottom: 1.5rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      height: 42px;
      font-size: 15px;
      letter-spacing: -0.025em;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 1.0);
      background: transparent;
      color: white;
      padding: 0 16px;
      margin-bottom: 8px;
      margin-right: 8px;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      transition: background-color 0.3s ease-in-out;
      text-decoration: none;
      cursor: pointer;
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    .btn svg {
      margin-right: 8px;
      width: 19px;
      height: 19px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="status-code">404</div>
    <div class="message">The resource you requested does not exist</div>
    <div>
      <a href="/" class="btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24">
          <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"/>
        </svg>
        <span>Go Home</span>
      </a>
    </div>
  </div>
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
