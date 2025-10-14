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

  // Редирект з .htm та .html на шлях без розширення
  if (/\.html?$/.test(path)) {
    let newPath;
    // Якщо це index.htm або index.html, редиректимо на директорію
    if (/\/index\.html?$/.test(path)) {
      newPath = path.replace(/\/index\.html?$/, '/');
    } else if (/^\/index\.html?$/.test(path)) {
      // Якщо це /index.html в корені
      newPath = '/';
    } else {
      // Інакше просто прибираємо розширення
      newPath = path.replace(/\.html?$/, '');
    }
    console.log(`${gray}${ip} => ${magenta}${path} => ${green}${newPath}${reset}`);
    return Response.redirect(`${url.origin}${newPath}`, 301);
  }

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
