// /netlify/edge-functions/block-rules.ts
import type { Context } from "@netlify/edge-functions";

// ⚠️ Пам'ятай: ці лічильники тримаються у пам'яті
// конкретного edge-ізоляту/регіону й скидаються при релоаді.
const counters = {
  php: 0,
  wp: 0,
};

export default async (request: Request, _ctx: Context) => {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();
  const query = url.search.toLowerCase();

  const isPhp =
    /\.php(?:$|[/?#])/i.test(path) || /\.php(?:$|[&=#])/i.test(query);

  const isWp =
    path.startsWith("/wp-") ||
    path.startsWith("/wp/") ||
    path.startsWith("/wordpress");

  if (!(isPhp || isWp)) {
    // пропускаємо нормальні запити
    return;
  }

  // тип сканера та інкремент лічильника
  const blockType = isPhp ? "php-scan" : "wp-scan";
  if (isPhp) counters.php += 1;
  else counters.wp += 1;

  // лог (видно в Edge logs нетліфая)
  const ua = request.headers.get("user-agent") || "-";
  const count = isPhp ? counters.php : counters.wp;
  console.log(
    JSON.stringify({
      at: new Date().toISOString(),
      type: blockType,
      path,
      query,
      ua,
      count,
    })
  );

  // 410 Gone + власні заголовки
  return new Response("Gone", {
    status: 410,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400",
      "X-Edge-Block": blockType,                // php-scan | wp-scan
      "X-Edge-Block-Count": String(count),      // локальний лічильник цього типу
    },
  });
};
