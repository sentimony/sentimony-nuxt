export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path !== '/' && !path.endsWith('/') && !path.match(/\.[a-z0-9]+$/i)) {
    const newPath = path + '/';
    const newUrl = `${url.origin}${newPath}${url.search}${url.hash}`;

    const ip =
      request.headers.get("x-nf-client-connection-ip") ||
      (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      "unknown";

    const gray = "\x1b[90m", magenta = "\x1b[35m", green = "\x1b[32m", reset = "\x1b[0m";
    console.log(`${gray}${ip} => ${magenta}${path} => ${green}${newPath}${reset}`);

    return Response.redirect(newUrl, 301);
  }

  return;
};
