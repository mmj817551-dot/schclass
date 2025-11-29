// Slot keys use Chinese-like identifiers; must stay in sync with backend SLOT_KEYS
// Backend uses: ['Ôç1', 'Ôç2', 'ÏÂ1', 'ÏÂ2', 'Íí1']
export const SLOTS = ['\u65e91', '\u65e92', '\u4e0b1', '\u4e0b2', '\u665a1'];

export const SUBJECTS = [
  '\u8bed\u6587',
  '\u6570\u5b66',
  '\u82f1\u8bed',
  '\u7269\u7406',
  '\u5316\u5b66',
  '\u751f\u7269',
  '\u5730\u7406',
  '\u653f\u6cbb',
  '\u5386\u53f2',
];

// Default display map (can be overridden by backend /config)
export const DEFAULT_SLOT_DISPLAY_MAP = {
  '\u65e91': '08:00-10:00',
  '\u65e92': '10:00-12:00',
  '\u4e0b1': '14:00-16:00',
  '\u4e0b2': '16:00-18:00',
  '\u665a1': '19:00-21:00',
};
