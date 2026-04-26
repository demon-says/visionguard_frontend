import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Bell, Shield, Brain, Camera,
  Sliders, Save, RefreshCw, ChevronRight, Info, Loader2,
  Banknote, Bus, ArrowRightLeft
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAllSettings, useUpdateDetectionSettings,
  useUpdateRouteThresholds, useUpdateNotifications, useUpdateCamera,
  useUpdateFineAmounts, useRoutes, useDrivers, useReassignDriver,
} from '../api/hooks';
import type { DetectionSetting, RouteThreshold, NotificationSettings, CameraSettings, SystemInfo, FineAmount } from '../api/types';

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button onClick={onToggle} className="relative w-11 h-6 rounded-full transition-all" style={{ background: enabled ? '#6366f1' : 'rgba(255,255,255,0.1)' }}>
    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: enabled ? '22px' : '2px' }} />
  </button>
);

const LoadingSkeleton = ({ height = 200 }: { height?: number }) => (
  <div className="animate-pulse rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', height }} />
);

const moduleColors: Record<string, string> = {
  phone: '#f97316',
  mobile: '#f97316',
  sunglasses: '#eab308',
  drowsiness: '#ef4444',
  drowsy: '#ef4444',
  smoking: '#a855f7',
};

const moduleLabels: Record<string, string> = {
  phone: 'Mobile Phone Detection',
  mobile: 'Mobile Phone Detection',
  sunglasses: 'Sunglasses Detection',
  drowsiness: 'Drowsiness Detection',
  drowsy: 'Drowsiness Detection',
  smoking: 'Smoking Detection',
};

const moduleDescs: Record<string, string> = {
  phone: 'Detects driver using phone while driving',
  mobile: 'Detects driver using phone while driving',
  sunglasses: 'Detects driver wearing unauthorized sunglasses',
  drowsiness: 'Analyzes eye closure and head position for drowsiness',
  drowsy: 'Analyzes eye closure and head position for drowsiness',
  smoking: 'Detects smoking behavior during driving',
};

const routeTypeColors: Record<string, string> = {
  demanding: '#10b981',
  moderate: '#3b82f6',
  simple: '#6b7280',
};

const difficultyLabels: Record<string, string> = {
  demanding: 'Demanding',
  moderate: 'Moderate',
  simple: 'Simple',
};

// ── Active Assignments sub-component ──────────────────────
function ActiveAssignments() {
  const { data: routesRes, loading: loadingRoutes, refetch: refetchRoutes } = useRoutes();
  const { data: driversRes, loading: loadingDrivers } = useDrivers({ status: 'active', limit: 100 });
  const { reassign, loading: reassigning } = useReassignDriver();
  const [reassigningId, setReassigningId] = useState<string | null>(null);

  const routes = routesRes?.data || [];
  const allDrivers = driversRes?.data || [];

  const handleReassign = async (routeId: string, busId: string, newDriverId: string) => {
    if (!newDriverId) return;
    setReassigningId(routeId);
    try {
      await reassign(routeId, newDriverId, busId);
      toast.success('Driver reassigned successfully');
      refetchRoutes();
    } catch {
      toast.error('Failed to reassign driver');
    } finally {
      setReassigningId(null);
    }
  };

  if (loadingRoutes || loadingDrivers) {
    return (
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="animate-pulse rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', height: 200 }} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2 mb-2">
        <ArrowRightLeft size={18} color="#6366f1" />
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Active Assignments</div>
      </div>
      <div style={{ color: '#475569', fontSize: 12, marginBottom: 16 }}>
        Assign which driver is linked to each bus / source camera. AI violations are routed to the assigned driver.
      </div>

      {routes.length === 0 ? (
        <div className="text-center py-8">
          <Bus size={28} color="#475569" className="mx-auto mb-2" />
          <div style={{ color: '#475569', fontSize: 13 }}>No routes with bus assignments found.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {routes.map(route => {
            const dc = routeTypeColors[route.difficulty] || '#6b7280';
            const isProcessing = reassigningId === route.id;
            return (
              <div
                key={route.id}
                className="p-4 rounded-xl flex flex-wrap items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Bus info */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <Bus size={18} color="#a5b4fc" />
                  </div>
                  <div>
                    <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{route.bus_number || 'No Bus'}</div>
                    <div style={{ color: '#475569', fontSize: 11 }}>Source: {(route as any).source_id || '–'}</div>
                  </div>
                </div>

                {/* Route */}
                <div className="min-w-[120px]">
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>Route</div>
                  <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{route.name}</div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: `${dc}15`, color: dc }}>
                    {difficultyLabels[route.difficulty] || route.difficulty}
                  </span>
                </div>

                {/* Arrow */}
                <div className="hidden sm:flex items-center">
                  <ArrowRightLeft size={16} color="#475569" />
                </div>

                {/* Driver selector */}
                <div className="flex-1 min-w-[220px]">
                  <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>Assigned Driver</div>
                  <div className="relative">
                    <select
                      value={route.driver_id || ''}
                      onChange={e => handleReassign(route.id, route.bus_id, e.target.value)}
                      disabled={isProcessing || !route.bus_id}
                      className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm font-semibold cursor-pointer transition-all outline-none disabled:opacity-50"
                      style={{
                        background: 'rgba(99,102,241,0.12)',
                        color: '#f1f5f9',
                        border: '1px solid rgba(99,102,241,0.3)',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                      }}
                    >
                      <option value="" style={{ background: '#111827', color: '#64748b' }}>— Select a Driver —</option>
                      {allDrivers.map(d => {
                        const score = d.safety_score ?? 0;
                        let eligible = false;
                        if (route.difficulty === 'simple') eligible = score >= 30;
                        else if (route.difficulty === 'moderate') eligible = score >= 60;
                        else if (route.difficulty === 'demanding') eligible = score >= 85;

                        return (
                          <option
                            key={d.id}
                            value={d.id}
                            disabled={!eligible}
                            style={{ background: '#111827', color: eligible ? '#f1f5f9' : '#475569' }}
                          >
                            {d.name} (Score: {score} · #{d.rank}){!eligible ? ' — Ineligible' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {/* Dropdown arrow / spinner */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isProcessing ? (
                        <Loader2 size={14} className="animate-spin" color="#6366f1" />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  // Load all settings from API
  const { data: settingsRes, loading, error, refetch } = useAllSettings();
  const { update: saveDetection, loading: savingDetection } = useUpdateDetectionSettings();
  const { update: saveThresholds, loading: savingThresholds } = useUpdateRouteThresholds();
  const { update: saveNotifications, loading: savingNotifications } = useUpdateNotifications();
  const { update: saveCamera, loading: savingCamera } = useUpdateCamera();
  const { update: saveFineAmounts, loading: savingFines } = useUpdateFineAmounts();

  const saving = savingDetection || savingThresholds || savingNotifications || savingCamera || savingFines;

  // Local state initialized from API
  const [detections, setDetections] = useState<DetectionSetting[]>([]);
  const [thresholds, setThresholds] = useState<RouteThreshold[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    alert_sound: true, email_alerts: false, sms_alerts: false, auto_flag: true, auto_suspend_threshold: 5,
  });
  const [camera, setCamera] = useState<CameraSettings>({
    resolution: '1080p', frame_rate: 30, retention_days: 30, capture_on_detection: true,
  });
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [fineAmounts, setFineAmounts] = useState<FineAmount[]>([]);

  // Populate state from API
  useEffect(() => {
    if (settingsRes?.data) {
      const d = settingsRes.data;
      if (d.detection?.length) setDetections(d.detection);
      if (d.thresholds?.length) setThresholds(d.thresholds);
      if (d.notifications) setNotifications(d.notifications);
      if (d.camera) setCamera(d.camera);
      if (d.system) setSystem(d.system);
      if (d.fineAmounts?.length) setFineAmounts(d.fineAmounts);
    }
  }, [settingsRes]);

  const handleSave = async () => {
    try {
      await Promise.all([
        saveDetection(detections),
        saveThresholds(thresholds),
        saveNotifications(notifications),
        saveCamera(camera),
        saveFineAmounts(fineAmounts),
      ]);
      toast.success('Settings saved successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to save some settings. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-5 max-w-4xl">
        <LoadingSkeleton height={60} />
        <LoadingSkeleton height={300} />
        <LoadingSkeleton height={200} />
        <LoadingSkeleton height={200} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div style={{ color: '#ef4444', fontWeight: 600 }}>Failed to load settings</div>
        <div style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>{error}</div>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 20 }}>System Settings</div>
          <div style={{ color: '#475569', fontSize: 13 }}>Configure Vision Guard AI detection parameters</div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
          style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>

      {/* AI Detection Settings */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} color="#6366f1" />
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>AI Detection Modules</div>
        </div>
        <div className="space-y-4">
          {detections.map((mod, idx) => {
            const color = moduleColors[mod.module_name] || '#6366f1';
            return (
              <div key={mod.module_name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <div>
                      <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{moduleLabels[mod.module_name] || mod.module_name}</div>
                      <div style={{ color: '#475569', fontSize: 12 }}>{moduleDescs[mod.module_name] || ''}</div>
                    </div>
                  </div>
                  <Toggle
                    enabled={mod.is_enabled}
                    onToggle={() => {
                      const next = [...detections];
                      next[idx] = { ...next[idx], is_enabled: !next[idx].is_enabled };
                      setDetections(next);
                    }}
                  />
                </div>
                <div className="flex items-center gap-3 ml-6 mt-2">
                  <span style={{ color: '#64748b', fontSize: 12, minWidth: 100 }}>Confidence: {mod.confidence_threshold}%</span>
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={mod.confidence_threshold}
                    onChange={e => {
                      const next = [...detections];
                      next[idx] = { ...next[idx], confidence_threshold: Number(e.target.value) };
                      setDetections(next);
                    }}
                    className="flex-1 accent-indigo-500"
                    style={{ maxWidth: 200 }}
                    disabled={!mod.is_enabled}
                  />
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', width: 100 }}>
                    <div className="h-full rounded-full" style={{ width: `${mod.confidence_threshold}%`, background: color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fine Amounts */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Banknote size={18} color="#eab308" />
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Fine Amounts</div>
        </div>
        <div style={{ color: '#475569', fontSize: 12, marginBottom: 16 }}>Configure the fine amount (PKR) for each violation type. Drivers with &gt;10 violations receive fines; others receive warnings.</div>
        <div className="grid md:grid-cols-2 gap-4">
          {fineAmounts.map((fa, idx) => {
            const color = moduleColors[fa.violation_type] || '#6366f1';
            return (
              <div key={fa.violation_type} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>
                    {moduleLabels[fa.violation_type] || fa.violation_type}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: '#64748b', fontSize: 14, fontWeight: 600 }}>PKR</span>
                  <input
                    type="number"
                    min="0"
                    value={fa.amount}
                    onChange={e => {
                      const next = [...fineAmounts];
                      next[idx] = { ...next[idx], amount: Number(e.target.value) };
                      setFineAmounts(next);
                    }}
                    className="w-32 px-3 py-2 rounded-lg text-center font-bold text-lg bg-transparent outline-none"
                    style={{ color: color, border: `1px solid ${color}40` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Assignments — Reassign drivers to buses */}
      <ActiveAssignments />

      {/* Route Assignment Settings */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sliders size={18} color="#06b6d4" />
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Route Assignment Thresholds</div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {thresholds.map((t, idx) => {
            const color = routeTypeColors[t.route_type] || '#6b7280';
            return (
              <div key={t.route_type} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>
                    {t.route_type.charAt(0).toUpperCase() + t.route_type.slice(1)} Route
                  </div>
                </div>
                <div style={{ color: '#475569', fontSize: 12 }}>Min safety score required</div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={t.min_safety_score}
                    onChange={e => {
                      const next = [...thresholds];
                      next[idx] = { ...next[idx], min_safety_score: Number(e.target.value) };
                      setThresholds(next);
                    }}
                    className="w-20 px-3 py-2 rounded-lg text-center font-bold text-lg bg-transparent outline-none"
                    style={{ color: color, border: `1px solid ${color}40` }}
                  />
                  <span style={{ color: '#475569', fontSize: 18 }}>%</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Info size={14} color="#6366f1" className="mt-0.5 shrink-0" />
          <div style={{ color: '#64748b', fontSize: 12 }}>Route assignments are automatically updated weekly based on driver safety scores. Drivers can be manually reassigned by administrators.</div>
        </div>
      </div>




      {/* System Info */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} color="#10b981" />
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>System Information</div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { label: 'Vision Guard Version', value: system?.system_version || '–' },
            { label: 'AI Model Version', value: system?.ai_model_version || '–' },
            { label: 'AI Endpoint', value: system?.ai_endpoint_url ? new URL(system.ai_endpoint_url).hostname : '–' },
            { label: 'Poll Interval', value: system?.ai_poll_interval_sec ? `${system.ai_poll_interval_sec}s` : '–' },
            { label: 'API Status', value: system?.api_status || '–', color: system?.api_status === 'active' ? '#10b981' : '#f59e0b' },
            { label: 'Last Health Check', value: system?.last_health_check ? new Date(system.last_health_check).toLocaleString() : '–' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#475569', fontSize: 11 }}>{item.label}</div>
              <div style={{ color: (item as any).color || '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
