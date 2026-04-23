// src/app/api/types.ts
// ─────────────────────────────────────────────────────────────
// TypeScript interfaces matching the Express backend's response
// shapes. All field names are snake_case to match the API contract.
// ─────────────────────────────────────────────────────────────

// ── Generic response wrappers ──────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

// ── Dashboard ──────────────────────────────────────────────

export interface DashboardSummary {
  total_drivers: number;
  active_drivers: number;
  inactive_drivers: number;
  suspended_drivers: number;
  total_violations: number;
  total_phone: number;
  total_sunglasses: number;
  total_drowsy: number;
  total_smoking: number;
  avg_safety_score: number;
  total_routes: number;
  pending_violations: number;
  flagged_violations: number;
  reviewed_violations: number;
  // Fine aggregates
  total_fines_issued: number;
  total_warnings_issued: number;
  total_fines_value: number;
}

export interface WeeklyTrendItem {
  detection_date: string;
  total: number;
  phone: number;
  sunglasses: number;
  drowsy: number;
  smoking: number;
}

export interface ViolationMixItem {
  name: string;
  value: number;
  color: string;
  pct?: number;
}

// ── Drivers ────────────────────────────────────────────────

export interface DriverStats {
  id: string;
  name: string;
  license_number: string;
  initials: string;
  avatar_color: string;
  status: 'active' | 'inactive' | 'suspended';
  safety_score: number;
  rank: number;
  total_violations: number;
  phone_violations: number;
  sunglasses_violations: number;
  drowsiness_violations: number;
  smoking_violations: number;
  route_id: string;
  route_name: string;
  route_type: 'demanding' | 'moderate' | 'simple';
  bus_number: string;
  recommended_route_type: string;
  experience_years: number;
  join_date: string;
  last_active: string;
  // Fine summary
  total_fines_count: number;
  total_warnings_count: number;
  total_fines_value: number;
}

export interface DriverProfile extends DriverStats {
  recentViolations: ViolationDetail[];
}

// ── Violations ─────────────────────────────────────────────

export interface ViolationDetail {
  id: string;
  violation_type: string;
  violation_label: string;
  driver_id: string;
  driver_name: string;
  initials: string;
  avatar_color: string;
  route_name: string;
  bus_number: string;
  confidence: number;
  status: 'pending' | 'reviewed' | 'flagged';
  detection_date: string;
  start_time: string;
  end_time: string;
  duration_sec: number;
  image_url: string;
  image_name: string;
  inserted_at: string;
  notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  // Penalty fields
  penalty_type?: 'fine' | 'warning' | null;
  fine_amount?: number | null;
  penalty_issued_at?: string | null;
  penalty_issued_by?: string | null;
}

export interface RecentViolation {
  id: string;
  violation_type: string;
  violation_label: string;
  driver_name: string;
  initials: string;
  avatar_color: string;
  route_name: string;
  confidence: number;
  status: string;
  detection_date: string;
  start_time: string;
  image_url: string;
  bus_number: string;
  penalty_type?: 'fine' | 'warning' | null;
}

// ── Routes ─────────────────────────────────────────────────

export interface RouteAssignment {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: number;
  difficulty: 'demanding' | 'moderate' | 'simple';
  stops: number;
  daily_trips: number;
  avg_travel_time: number;
  passenger_capacity: number;
  description: string;
  bus_id: string;
  bus_number: string;
  driver_id: string | null;
  driver_name: string | null;
  driver_initials: string | null;
  driver_avatar_color: string | null;
  driver_safety_score: number | null;
  driver_rank: number | null;
  totalViolationsOnRoute?: number;
}

// ── Reports ────────────────────────────────────────────────

export interface ReportKPIs {
  totalViolations: number;
  fleetSafetyScore: number;
  driversImproved: number;
  detectionAccuracy: number;
}

export interface MonthlyComparison {
  thisMonth: { detection_date: string; total: number }[];
  lastMonth: { detection_date: string; total: number }[];
}

export interface HourlyPatternItem {
  hour: number;
  total_violations: number;
  phone: number;
  sunglasses: number;
  drowsy: number;
  smoking: number;
}

export interface DriverScoreItem {
  id: string;
  name: string;
  initials: string;
  avatar_color: string;
  safety_score: number;
  rank: number;
  total_violations: number;
  route_type: string;
}

// ── Settings ───────────────────────────────────────────────

export interface DetectionSetting {
  id?: string;
  module_name: string;
  is_enabled: boolean;
  confidence_threshold: number;
}

export interface RouteThreshold {
  id?: string;
  route_type: string;
  min_safety_score: number;
}

export interface NotificationSettings {
  id?: string;
  alert_sound: boolean;
  email_alerts: boolean;
  sms_alerts: boolean;
  auto_flag: boolean;
  auto_suspend_threshold: number;
}

export interface CameraSettings {
  id?: string;
  resolution: string;
  frame_rate: number;
  retention_days: number;
  capture_on_detection: boolean;
}

export interface SystemInfo {
  system_version: string;
  ai_model_version: string;
  api_status: string;
  ai_endpoint_url: string;
  ai_poll_interval_sec: number;
  last_health_check: string;
}

export interface AllSettings {
  detection: DetectionSetting[];
  thresholds: RouteThreshold[];
  notifications: NotificationSettings;
  camera: CameraSettings;
  system: SystemInfo;
  fineAmounts: FineAmount[];
}

// ── Fines / Penalties ─────────────────────────────────────

export interface FineAmount {
  id?: string;
  violation_type: string;
  amount: number;
  updated_at?: string;
}

export interface PenaltyResult {
  penaltyType: 'fine' | 'warning';
  fineAmount: number | null;
  violationCount: number;
  message: string;
}

// ── AI ─────────────────────────────────────────────────────

export interface AiStatus {
  isRunning: boolean;
  lastFetchAt: string | null;
  lastError: string | null;
  fetchCount: number;
  totalInserted: number;
}

export interface AiConfig {
  ai_endpoint_url: string;
  ai_poll_interval_sec: number;
  api_status: string;
}
