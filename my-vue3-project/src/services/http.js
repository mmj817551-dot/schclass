// Lightweight HTTP wrapper for uni-app with optional fetch fallback
// - Base URL default: /api
// - Authorization header via setTokenProvider(() => token)
// - Returns { data, meta } when API envelope is { success, data, meta }

const _cfg = {
  baseURL: '/api',
  tokenProvider: null,
};

const _hooks = {
  onStart: null,
  onEnd: null,
};

export function setBaseURL(url) {
  _cfg.baseURL = url || '/api';
}

export function setTokenProvider(fn) {
  _cfg.tokenProvider = typeof fn === 'function' ? fn : null;
}

export function setLoadingHooks(onStart, onEnd) {
  _hooks.onStart = typeof onStart === 'function' ? onStart : null;
  _hooks.onEnd = typeof onEnd === 'function' ? onEnd : null;
}

function joinURL(base, path) {
  if (!base) return path;
  if (!path) return base;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

function appendParams(url, params) {
  if (!params || typeof params !== 'object') return url;
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach((vv) => usp.append(k, vv));
    } else {
      usp.append(k, v);
    }
  });
  const qs = usp.toString();
  if (!qs) return url;
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
}

function buildHeaders(extra) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, extra || {});
  if (_cfg.tokenProvider) {
    try {
      const token = _cfg.tokenProvider();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch (_) {}
  }
  return headers;
}

function isUniAvailable() {
  try {
    return typeof uni !== 'undefined' && typeof uni.request === 'function';
  } catch (_) {
    return false;
  }
}

function normalizeResponse(body, status, headers) {
  // Expect API envelope: { success, data, meta }
  if (body && typeof body === 'object' && 'success' in body) {
    if (body.success) return { data: body.data, meta: body.meta, status, headers };
    const err = new Error(body?.error?.message || 'Request failed');
    err.code = body?.error?.code || 'API_ERROR';
    err.details = body?.error?.details;
    err.status = status;
    throw err;
  }
  // Fallback: return whole body
  return { data: body, meta: undefined, status, headers };
}

export async function request({ url, method = 'GET', params, data, headers, showLoading = false, responseType } = {}) {
  const full = appendParams(joinURL(_cfg.baseURL, url), params);
  const hdrs = buildHeaders(headers);
  if (_hooks.onStart) {
    try { _hooks.onStart(); } catch (_) {}
  }

  if (isUniAvailable()) {
    return new Promise((resolve, reject) => {
      const opts = {
        url: full,
        method,
        data,
        header: hdrs,
        responseType, // e.g., 'arraybuffer' for file
        success: (res) => {
          try {
            const normalized = normalizeResponse(res.data, res.statusCode, res.header);
            resolve(normalized);
          } catch (e) {
            reject(e);
          }
        },
        fail: (err) => {
          const e = new Error(err?.errMsg || 'Network error');
          e.status = 0;
          reject(e);
        },
        complete: () => {
          if (showLoading) {
            // integrate with UI loader if needed later
          }
          if (_hooks.onEnd) {
            try { _hooks.onEnd(); } catch (_) {}
          }
        },
      };
      if (showLoading) {
        try { uni.showLoading({ title: '加载中' }); } catch (_) {}
        const origComplete = opts.complete;
        opts.complete = () => {
          try { uni.hideLoading(); } catch (_) {}
          origComplete && origComplete();
        };
      }
      uni.request(opts);
    });
  }

  // Fallback to fetch (H5/SSR tools, if uni not available)
  const init = { method, headers: hdrs };
  if (data !== undefined && data !== null) {
    init.body = typeof data === 'string' ? data : JSON.stringify(data);
  }
  const res = await fetch(full, init);
  const ct = res.headers.get('content-type') || '';
  const isJSON = ct.includes('application/json');
  const body = isJSON ? await res.json() : await res.arrayBuffer();
  if (!res.ok) {
    const e = new Error(`HTTP ${res.status}`);
    e.status = res.status;
    e.body = body;
    if (_hooks.onEnd) {
      try { _hooks.onEnd(); } catch (_) {}
    }
    throw e;
  }
  const normalized = normalizeResponse(body, res.status, Object.fromEntries(res.headers.entries()));
  if (_hooks.onEnd) {
    try { _hooks.onEnd(); } catch (_) {}
  }
  return normalized;
}

export async function get(url, opts = {}) {
  return request({ url, method: 'GET', ...opts });
}

export async function post(url, data, opts = {}) {
  return request({ url, method: 'POST', data, ...opts });
}

export async function patch(url, data, opts = {}) {
  return request({ url, method: 'PATCH', data, ...opts });
}

export async function del(url, opts = {}) {
  return request({ url, method: 'DELETE', ...opts });
}

export const http = { request, get, post, patch, del, setBaseURL, setTokenProvider, setLoadingHooks };
