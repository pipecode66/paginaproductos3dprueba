export function normalizeVercelRewrite(request) {
  const rewrittenPath = Array.isArray(request.query?.path)
    ? request.query.path.join('/')
    : request.query?.path;

  if (!rewrittenPath || !/^\/api\/index(?:\?|$)/.test(request.url || '')) return;

  const currentUrl = new URL(request.url, 'http://vercel.local');
  currentUrl.searchParams.delete('path');
  const search = currentUrl.searchParams.toString();
  request.url = `/api/${String(rewrittenPath).replace(/^\/+/, '')}${search ? `?${search}` : ''}`;
}
