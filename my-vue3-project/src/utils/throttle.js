// Simple debounce and throttle helpers

export function debounce(fn, delay = 300) {
  let t = null;
  return function debounced(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function throttle(fn, interval = 300) {
  let last = 0;
  let pending = null;
  return function throttled(...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    } else {
      pending && clearTimeout(pending);
      pending = setTimeout(() => {
        last = Date.now();
        fn.apply(this, args);
      }, interval - (now - last));
    }
  };
}

