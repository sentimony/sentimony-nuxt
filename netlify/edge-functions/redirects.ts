export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // IP клієнта з Edge заголовка (fallback на X-Forwarded-For)
  const ip =
    request.headers.get("x-nf-client-connection-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown";

  // Кольори для логування
  const gray = "\x1b[90m", magenta = "\x1b[35m", green = "\x1b[32m", reset = "\x1b[0m";

  // Release GooglePlay редирект на YouTube Music
  if (/^\/release\/[^\/]+\/googleplay/.test(path)) {
    const match = path.match(/^(\/release\/[^\/]+)\/googleplay.*$/);
    if (match) {
      const releasePath = match[1];
      const newPath = `${releasePath}/youtubemusic`;
      console.log(`${gray}${ip} => ${magenta}${path} => ${green}${newPath}${reset}`);
      return Response.redirect(`${url.origin}${newPath}`, 301);
    }
  }

  // Якщо жоден редирект не спрацював, передаємо далі
  return;
};
