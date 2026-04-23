// src/app/api/hooks.ts
// ─────────────────────────────────────────────────────────────
// Custom React hooks wrapping every API endpoint.
// Each hook manages loading, error, and data state.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiError } from './apiClient';
import type {
  ApiResponse,
  PaginatedResponse,
  DashboardSummary,
  WeeklyTrendItem,
  ViolationMixItem,
  RecentViolation,
  DriverStats,
  DriverProfile,
  ViolationDetail,
  RouteAssignment,
  ReportKPIs,
  MonthlyComparison,
  HourlyPatternItem,
  DriverScoreItem,
  AllSettings,
  DetectionSetting,
  RouteThreshold,
  NotificationSettings,
  CameraSettings,
  AiStatus,
  AiConfig,
  FineAmount,
  PenaltyResult,
} from './types';

// ── Generic fetch hook ─────────────────────────────────────

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof ApiError ? err.message : 'An unexpected error occurred');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ── Polling variant ────────────────────────────────────────

function usePolledApi<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  deps: unknown[] = [],
): UseApiResult<T> {
  const result = useApi(fetcher, deps);

  useEffect(() => {
    const timer = setInterval(() => {
      result.refetch();
    }, intervalMs);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, result.refetch]);

  return result;
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD HOOKS
// ─────────────────────────────────────────────────────────────

// Polled version for dashboard and layout (30s auto-refresh)
export function useDashboardSummaryPolled() {
  return usePolledApi<ApiResponse<DashboardSummary>>(
    () => api.get('/api/dashboard/summary'),
    30_000,
    [],
  );
}

export function useRecentViolations(limit = 5) {
  return usePolledApi<ApiResponse<RecentViolation[]>>(
    () => api.get('/api/dashboard/recent', { limit }),
    30_000,
    [limit],
  );
}

export function useTopDrivers(limit = 3) {
  return useApi<ApiResponse<DriverStats[]>>(
    () => api.get('/api/dashboard/top-drivers', { limit }),
    [limit],
  );
}

export function useBottomDrivers(limit = 3) {
  return useApi<ApiResponse<DriverStats[]>>(
    () => api.get('/api/dashboard/bottom-drivers', { limit }),
    [limit],
  );
}

export function useWeeklyTrend() {
  return useApi<ApiResponse<WeeklyTrendItem[]>>(
    () => api.get('/api/dashboard/weekly-trend'),
    [],
  );
}

export function useDashboardViolationMix() {
  return useApi<ApiResponse<ViolationMixItem[]>>(
    () => api.get('/api/dashboard/violation-mix'),
    [],
  );
}

// ─────────────────────────────────────────────────────────────
// DRIVERS HOOKS
// ─────────────────────────────────────────────────────────────

export interface DriverFilters {
  status?: string;
  routeType?: string;
  search?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}

export function useDrivers(filters: DriverFilters) {
  return useApi<PaginatedResponse<DriverStats>>(
    () => api.get('/api/drivers', filters as Record<string, unknown>),
    [filters.status, filters.routeType, filters.search, filters.sortBy, filters.order, filters.page, filters.limit],
  );
}

export function useDriver(id: string | undefined) {
  return useApi<ApiResponse<DriverProfile>>(
    () => api.get(`/api/drivers/${id}`),
    [id],
  );
}

export function useDriverViolations(
  id: string | undefined,
  filters?: { type?: string; status?: string; page?: number; limit?: number },
) {
  return useApi<PaginatedResponse<ViolationDetail>>(
    () => api.get(`/api/drivers/${id}/violations`, filters as Record<string, unknown>),
    [id, filters?.type, filters?.status, filters?.page, filters?.limit],
  );
}

// ─────────────────────────────────────────────────────────────
// VIOLATIONS HOOKS
// ─────────────────────────────────────────────────────────────

export interface ViolationFilters {
  type?: string;
  status?: string;
  driverName?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function useViolations(filters: ViolationFilters) {
  return useApi<PaginatedResponse<ViolationDetail>>(
    () => api.get('/api/violations', filters as Record<string, unknown>),
    [filters.type, filters.status, filters.driverName, filters.dateFrom, filters.dateTo, filters.page, filters.limit],
  );
}

export function useUpdateViolation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (
    id: string,
    body: { status?: string; notes?: string; reviewedBy?: string },
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.patch<ApiResponse<unknown>>(`/api/violations/${id}`, body);
      return result;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update violation';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useBulkUpdateViolations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkUpdate = async (
    ids: string[],
    status: string,
    reviewedBy?: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.patch<ApiResponse<{ updated: number }>>('/api/violations/bulk', {
        ids,
        status,
        reviewedBy,
      });
      return result;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to bulk update violations';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { bulkUpdate, loading, error };
}

// ─────────────────────────────────────────────────────────────
// ROUTES HOOKS
// ─────────────────────────────────────────────────────────────

export function useRoutes(difficulty?: string) {
  return useApi<ApiResponse<RouteAssignment[]>>(
    () => api.get('/api/routes', difficulty && difficulty !== 'all' ? { difficulty } : {}),
    [difficulty],
  );
}

export function useRouteRecommendation(driverId: string) {
  return useApi<ApiResponse<{
    driverId: string;
    driverName: string;
    safetyScore: number;
    recommended: string;
    thresholds: { route_type: string; min_safety_score: number }[];
  }>>(
    () => api.get(`/api/routes/recommend/${driverId}`),
    [driverId],
  );
}

// ─────────────────────────────────────────────────────────────
// REPORTS HOOKS
// ─────────────────────────────────────────────────────────────

export function useReportKPIs() {
  return useApi<ApiResponse<ReportKPIs>>(
    () => api.get('/api/reports/kpis'),
    [],
  );
}

export function useDailyTrend(days = 30) {
  return useApi<ApiResponse<WeeklyTrendItem[]>>(
    () => api.get('/api/reports/daily-trend', { days }),
    [days],
  );
}

export function useMonthlyComparison() {
  return useApi<ApiResponse<MonthlyComparison>>(
    () => api.get('/api/reports/monthly-comparison'),
    [],
  );
}

export function useHourlyPattern() {
  return useApi<ApiResponse<HourlyPatternItem[]>>(
    () => api.get('/api/reports/hourly-pattern'),
    [],
  );
}

export function useReportViolationMix() {
  return useApi<ApiResponse<ViolationMixItem[]>>(
    () => api.get('/api/reports/violation-mix'),
    [],
  );
}

export function useDriverScores() {
  return useApi<ApiResponse<DriverScoreItem[]>>(
    () => api.get('/api/reports/driver-scores'),
    [],
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS HOOKS
// ─────────────────────────────────────────────────────────────

export function useAllSettings() {
  return useApi<ApiResponse<AllSettings>>(
    () => api.get('/api/settings/all'),
    [],
  );
}

export function useUpdateDetectionSettings() {
  const [loading, setLoading] = useState(false);

  const update = async (settings: DetectionSetting[]) => {
    setLoading(true);
    try {
      return await api.put<ApiResponse<DetectionSetting[]>>('/api/settings/detection', settings);
    } finally {
      setLoading(false);
    }
  };

  return { update, loading };
}

export function useUpdateRouteThresholds() {
  const [loading, setLoading] = useState(false);

  const update = async (thresholds: RouteThreshold[]) => {
    setLoading(true);
    try {
      return await api.put<ApiResponse<RouteThreshold[]>>('/api/settings/route-thresholds', thresholds);
    } finally {
      setLoading(false);
    }
  };

  return { update, loading };
}

export function useUpdateNotifications() {
  const [loading, setLoading] = useState(false);

  const update = async (settings: Partial<NotificationSettings>) => {
    setLoading(true);
    try {
      return await api.put<ApiResponse<NotificationSettings>>('/api/settings/notifications', settings);
    } finally {
      setLoading(false);
    }
  };

  return { update, loading };
}

export function useUpdateCamera() {
  const [loading, setLoading] = useState(false);

  const update = async (settings: Partial<CameraSettings>) => {
    setLoading(true);
    try {
      return await api.put<ApiResponse<CameraSettings>>('/api/settings/camera', settings);
    } finally {
      setLoading(false);
    }
  };

  return { update, loading };
}

// ─────────────────────────────────────────────────────────────
// AI HOOKS
// ─────────────────────────────────────────────────────────────

export function useAiStatus() {
  return usePolledApi<ApiResponse<AiStatus>>(
    () => api.get('/api/ai/status'),
    15_000,
    [],
  );
}

export function useAiConfig() {
  return useApi<ApiResponse<AiConfig>>(
    () => api.get('/api/ai/config'),
    [],
  );
}

// ─────────────────────────────────────────────────────────────
// DRIVER STATUS UPDATE
// ─────────────────────────────────────────────────────────────

export function useUpdateDriverStatus() {
  const [loading, setLoading] = useState(false);

  const update = async (id: string, status: string) => {
    setLoading(true);
    try {
      return await api.patch<ApiResponse<{ id: string; name: string; status: string }>>(
        `/api/drivers/${id}/status`,
        { status },
      );
    } finally {
      setLoading(false);
    }
  };

  return { update, loading };
}

// ─────────────────────────────────────────────────────────────
// PENALTY HOOKS
// ─────────────────────────────────────────────────────────────

// Issue a penalty on a single violation
export function useIssuePenalty() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const issue = async (violationId: string, issuedBy?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.post<ApiResponse<PenaltyResult>>(
        `/api/penalties/${violationId}`,
        { issuedBy: issuedBy || 'Admin' },
      );
      return result;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to issue penalty';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { issue, loading, error };
}

// Paginated list of penalties for a specific driver
export function useDriverPenalties(
  driverId: string | undefined,
  filters?: { page?: number; limit?: number },
) {
  return useApi<PaginatedResponse<ViolationDetail>>(
    () => api.get(`/api/penalties/driver/${driverId}`, filters as Record<string, unknown>),
    [driverId, filters?.page, filters?.limit],
  );
}

// Fine amounts (for settings page)
export function useFineAmounts() {
  return useApi<ApiResponse<FineAmount[]>>(
    () => api.get('/api/fine-amounts'),
    [],
  );
}

export function useUpdateFineAmounts() {
  const [loading, setLoading] = useState(false);
  const update = async (amounts: FineAmount[]) => {
    setLoading(true);
    try {
      return await api.put<ApiResponse<FineAmount[]>>('/api/fine-amounts', amounts);
    } finally {
      setLoading(false);
    }
  };
  return { update, loading };
}
