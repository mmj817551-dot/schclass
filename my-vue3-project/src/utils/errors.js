// Error mapping helper for user-friendly messages
export function errorMessage(err, fallback = '\u64cd\u4f5c\u5931\u8d25') {
  if (!err) return fallback;
  const code = err.code || err.status || '';
  const map = {
    UNAUTHORIZED: '\u672a\u767b\u5f55\u6216\u767b\u5f55\u5df2\u8fc7\u671f',
    FORBIDDEN: '\u6ca1\u6709\u6743\u9650\u6267\u884c\u8be5\u64cd\u4f5c',
    VALIDATION_ERROR: '\u63d0\u4ea4\u7684\u6570\u636e\u4e0d\u5b8c\u6574\u6216\u4e0d\u5408\u6cd5',
    RESERVATION_CONFLICT: '\u8be5\u65f6\u95f4\u6bb5\u5df2\u88ab\u5360\u7528',
    CAPACITY_EXCEEDED: '\u8d85\u8fc7\u6559\u5ba4\u5bb9\u91cf\u9650\u5236',
    API_ERROR: err.message || fallback,
  };
  if (typeof code === 'number') {
    if (code === 401) return map.UNAUTHORIZED;
    if (code === 403) return map.FORBIDDEN;
    if (code === 409) return '\u8d44\u6e90\u51b2\u7a81\uff0c\u8bf7\u68c0\u67e5\u540e\u91cd\u8bd5';
    if (code >= 500) return '\u670d\u52a1\u5668\u5f00\u5c0f\u5dee\u4e86\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5';
  }
  return map[code] || err.message || fallback;
}
