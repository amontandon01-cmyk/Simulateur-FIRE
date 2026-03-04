export const uuid = () =>
  (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : ('id-' + Math.random().toString(16).slice(2) + Date.now().toString(16));

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const getNum = (el) => parseFloat(el?.value) || 0;
export const getInt = (el) => parseInt(el?.value, 10) || 0;

export const defaultSegments = () => ([
  { id: uuid(), from: 2025, to: 2026, monthly: 1000, annual: 6000 },
  { id: uuid(), from: 2026, to: 2027, monthly: 2340, annual: 7500 },
  { id: uuid(), from: 2027, to: 2039, monthly: 3000, annual: 8000 },
]);
