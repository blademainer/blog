export function GET() {
  return new Response(
    '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/about/gallup/"><link rel="canonical" href="https://xiongyingqi.com/about/gallup/"><title>历史页面 · Blademainer</title><p><a href="/about/gallup/">继续阅读原页面</a></p></html>',
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
