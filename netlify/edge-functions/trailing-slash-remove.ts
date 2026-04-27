export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Перевіряємо чи є trailing slash (крім кореневого шляху "/")
  if (path.length > 1 && path.endsWith('/')) {
    const newPath = path.slice(0, -1); // прибираємо останній "/"
    const newUrl = `${url.origin}${newPath}${url.search}${url.hash}`;

    // IP клієнта з Edge заголовка (fallback на X-Forwarded-For)
    const ip =
      request.headers.get("x-nf-client-connection-ip") ||
      (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      "unknown";

    // Кольори для логування
    const gray = "\x1b[90m", magenta = "\x1b[35m", green = "\x1b[32m", reset = "\x1b[0m";
    console.log(`${gray}${ip} => ${magenta}${path} => ${green}${newPath}${reset}`);

    return Response.redirect(newUrl, 301);
  }

  // Якщо trailing slash немає, передаємо далі
  return;
};
