export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname;

  const ip =
    request.headers.get("x-nf-client-connection-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
    "unknown";

  const gray = "\x1b[90m", magenta = "\x1b[35m", green = "\x1b[32m", reset = "\x1b[0m";

  if (/\.html?$/.test(path)) {
    let newPath;
    if (/\/index\.html?$/.test(path)) {
      newPath = path.replace(/\/index\.html?$/, '/');
    } else if (/^\/index\.html?$/.test(path)) {
      newPath = '/';
    } else {
      newPath = path.replace(/\.html?$/, '');
    }
    console.log(`${gray}${ip} => ${magenta}${path} => ${green}${newPath}${reset}`);
    return Response.redirect(`${url.origin}${newPath}`, 301);
  }

  if (/^\/login\/?$/.test(path)) {
    const newPath = '/signin';
    console.log(`${gray}${ip} => ${magenta}${path} => ${green}${newPath}${reset}`);
    return Response.redirect(`${url.origin}${newPath}`, 301);
  }

  if (/^\/release\/[^\/]+\/googleplay/.test(path)) {
    const match = path.match(/^(\/release\/[^\/]+)\/googleplay.*$/);
    if (match?.[1]) {
      const releasePath = match[1];
      const newPath = `${releasePath}/youtubemusic`;
      console.log(`${gray}${ip} => ${magenta}${path} => ${green}${newPath}${reset}`);
      return Response.redirect(`${url.origin}${newPath}`, 301);
    }
  }

  return;
};
