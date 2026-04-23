// src/app/data/constants.ts
// ─────────────────────────────────────────────────────────────
// Display-logic constants kept from the original mockData.ts.
// These define colors, labels, and types used across the UI —
// they are NOT data, they are presentation helpers.
// ─────────────────────────────────────────────────────────────

export type ViolationType = 'phone' | 'sunglasses' | 'drowsiness' | 'smoking';
export type RouteType = 'demanding' | 'moderate' | 'simple';
export type ViolationStatus = 'reviewed' | 'pending' | 'flagged';
export type DriverStatus = 'active' | 'inactive' | 'suspended';

// Also support the backend's "mobile" / "drowsy" naming
export type BackendViolationType = 'mobile' | 'sunglasses' | 'drowsy' | 'smoking';

export const VIOLATION_COLORS: Record<string, string> = {
  phone: '#f97316',
  mobile: '#f97316',
  sunglasses: '#eab308',
  drowsiness: '#ef4444',
  drowsy: '#ef4444',
  smoking: '#a855f7',
};

export const VIOLATION_LABELS: Record<string, string> = {
  phone: 'Phone Usage',
  mobile: 'Phone Usage',
  sunglasses: 'Wearing Sunglasses',
  drowsiness: 'Drowsiness',
  drowsy: 'Drowsiness',
  smoking: 'Smoking',
};

export const ROUTE_COLORS: Record<RouteType, string> = {
  demanding: '#10b981',
  moderate: '#3b82f6',
  simple: '#6b7280',
};

export const ROUTE_LABELS: Record<RouteType, string> = {
  demanding: 'Demanding',
  moderate: 'Moderate',
  simple: 'Simple',
};

// Fine amounts for display (mirrors DB seed — used for offline/fallback UI display only)
export const FINE_AMOUNTS: Record<string, number> = {
  mobile:     10000,
  drowsy:     12000,
  smoking:     8000,
  sunglasses:  6000,
};

export const FINE_THRESHOLD = 10; // violations > this → fine eligible

export type PenaltyType = 'fine' | 'warning';
