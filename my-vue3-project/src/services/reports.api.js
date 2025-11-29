import { get } from './http.js';

// Return a direct download URL; consumer can use <a href=...>
export function getMonthlyReportUrl({ month, format = 'csv' }) {
  const params = new URLSearchParams({ month, format });
  return `/api/reports/monthly?${params.toString()}`;
}

// Optional: try fetch report as ArrayBuffer (uni.request: responseType='arraybuffer')
export async function fetchMonthlyReport({ month, format = 'csv' }) {
  const { data } = await get('/reports/monthly', { params: { month, format }, responseType: 'arraybuffer' });
  return data; // ArrayBuffer when supported
}

