import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft, Shield, AlertTriangle, Phone, Glasses, Brain,
  Cigarette, Map, Calendar, Hash, Clock, TrendingUp, Award, Loader2,
  Gavel, X, Banknote
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { toast } from 'sonner';
import { VIOLATION_COLORS, VIOLATION_LABELS, ROUTE_COLORS, ROUTE_LABELS, FINE_AMOUNTS, FINE_THRESHOLD } from '../data/constants';
import { useDriver, useIssuePenalty, useUpdateDriverStatus } from '../api/hooks';

const safetyColor = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const violationIcons: Record<string, any> = {
  phone: Phone,
  mobile: Phone,
  sunglasses: Glasses,
  drowsiness: Brain,
  drowsy: Brain,
  smoking: Cigarette,
};

const LoadingSkeleton = ({ height = 200 }: { height?: number }) => (
  <div className="animate-pulse rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', height }} />
);

// Penalty badge (reused from Violations)
function PenaltyBadge({ penalty_type, fine_amount }: {
  penalty_type?: string | null;
  fine_amount?: number | null;
}) {
  if (!penalty_type) return null;
  if (penalty_type === 'fine') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
      >
        Fine · PKR {Number(fine_amount).toLocaleString()}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
    >
      Warning
    </span>
  );
}

// Penalty confirmation dialog
function PenaltyConfirmDialog({
  violation,
  onConfirm,
  onCancel,
  loading,
}: {
  violation: { id: string; driver_name: string; violation_type: string };
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const fineAmount = FINE_AMOUNTS[violation.violation_type] ?? 0;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-2xl p-6 max-w-md w-full mx-4"
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Gavel size={20} color="#f59e0b" />
            </div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>Issue Penalty</div>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X size={16} color="#64748b" />
          </button>
        </div>
        <div className="space-y-3 mb-6">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>Driver</div>
            <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{violation.driver_name}</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>Violation Type</div>
            <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{VIOLATION_LABELS[violation.violation_type] || violation.violation_type}</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>Potential Fine Amount</div>
            <div style={{ color: '#ef4444', fontSize: 18, fontWeight: 700 }}>PKR {fineAmount.toLocaleString()}</div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
              Fine is issued if driver has &gt;{FINE_THRESHOLD} total violations. Otherwise, a warning is issued.
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
            {loading ? 'Processing...' : 'Confirm Penalty'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DriverDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: result, loading, error, refetch } = useDriver(id);
  const { issue: issuePenalty, loading: issuingPenalty } = useIssuePenalty();
  const { update: updateDriverStatus, loading: updatingStatus } = useUpdateDriverStatus();

  // Penalty dialog state
  const [penaltyTarget, setPenaltyTarget] = useState<{
    id: string; driver_name: string; violation_type: string;
  } | null>(null);

  const handleIssuePenalty = async () => {
    if (!penaltyTarget) return;
    try {
      const res = await issuePenalty(penaltyTarget.id, 'Admin');
      const msg = res?.data?.message || 'Penalty issued successfully';
      if (res?.data?.penaltyType === 'fine') {
        toast.success(msg);
      } else {
        toast.info(msg);
      }
      setPenaltyTarget(null);
      refetch();
    } catch {
      toast.error('Failed to issue penalty');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-5">
        <LoadingSkeleton height={40} />
        <LoadingSkeleton height={200} />
        <div className="grid lg:grid-cols-3 gap-5">
          <LoadingSkeleton height={300} />
          <LoadingSkeleton height={300} />
          <LoadingSkeleton height={300} />
        </div>
      </div>
    );
  }

  if (error || !result?.data) {
    return (
      <div className="p-6 text-center">
        <div style={{ color: '#f1f5f9', fontSize: 18 }}>{error || 'Driver not found.'}</div>
        <Link to="/drivers" className="text-indigo-400 underline mt-2 inline-block">Back to Drivers</Link>
      </div>
    );
  }

  const driver = result.data;
  const driverViolations = driver.recentViolations || [];
  const scoreColor = safetyColor(driver.safety_score);
  const routeColor = ROUTE_COLORS[driver.route_type as keyof typeof ROUTE_COLORS] || '#6b7280';

  const statusStyles: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    inactive: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    suspended: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  };
  const statusStyle = statusStyles[driver.status] || statusStyles.active;

  // Radar data for skills
  const radarData = [
    { subject: 'Punctuality', A: 90 - driver.total_violations * 2 },
    { subject: 'Focus', A: driver.safety_score },
    { subject: 'Safety', A: driver.safety_score - 5 },
    { subject: 'Compliance', A: Math.max(20, 100 - driver.total_violations * 8) },
    { subject: 'Experience', A: Math.min(100, (driver.experience_years || 1) * 8) },
  ];

  // Violation history bar data
  const violationBarData = [
    { name: 'Phone', value: driver.phone_violations, color: VIOLATION_COLORS.phone },
    { name: 'Sunglasses', value: driver.sunglasses_violations, color: VIOLATION_COLORS.sunglasses },
    { name: 'Drowsiness', value: driver.drowsiness_violations, color: VIOLATION_COLORS.drowsiness },
    { name: 'Smoking', value: driver.smoking_violations, color: VIOLATION_COLORS.smoking },
  ];

  // Fine display
  const hasFines = (driver.total_fines_count ?? 0) > 0;
  const hasWarnings = (driver.total_warnings_count ?? 0) > 0;

  return (
    <div className="p-6 space-y-5">
      {/* Penalty confirmation dialog */}
      {penaltyTarget && (
        <PenaltyConfirmDialog
          violation={penaltyTarget}
          onConfirm={handleIssuePenalty}
          onCancel={() => setPenaltyTarget(null)}
          loading={issuingPenalty}
        />
      )}

      {/* Back */}
      <Link
        to="/drivers"
        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
        style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }}
      >
        <ArrowLeft size={14} /> Back to Drivers
      </Link>

      {/* Profile header */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex flex-wrap items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold"
              style={{ background: `linear-gradient(135deg, ${driver.avatar_color}40, ${driver.avatar_color}20)`, color: driver.avatar_color, border: `2px solid ${driver.avatar_color}40` }}
            >
              {driver.initials}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2"
              style={{
                background: statusStyle.color,
                borderColor: '#0d1528',
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700 }}>{driver.name}</h2>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
              >
                {driver.status.toUpperCase()}
              </span>
              <button
                disabled={updatingStatus}
                onClick={async () => {
                  const newStatus = driver.status === 'suspended' ? 'active' : 'suspended';
                  try {
                    await updateDriverStatus(driver.id, newStatus);
                    toast.success(`Driver ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
                    refetch();
                  } catch {
                    toast.error('Failed to update driver status');
                  }
                }}
                className="px-3 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80"
                style={{
                  background: driver.status === 'suspended' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: driver.status === 'suspended' ? '#10b981' : '#ef4444',
                  border: `1px solid ${driver.status === 'suspended' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  cursor: updatingStatus ? 'wait' : 'pointer',
                  opacity: updatingStatus ? 0.5 : 1,
                }}
              >
                {updatingStatus ? '...' : driver.status === 'suspended' ? '✓ Activate' : '✕ Suspend'}
              </button>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: `${routeColor}15`, color: routeColor }}
              >
                {ROUTE_LABELS[driver.route_type as keyof typeof ROUTE_LABELS] || driver.route_type} Route
              </span>
            </div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
              {driver.license_number} • {driver.experience_years || 0} years experience
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Safety Score', value: `${driver.safety_score}%`, color: scoreColor },
                { label: 'Global Rank', value: `#${driver.rank}`, color: '#6366f1' },
                { label: 'Total Violations', value: driver.total_violations, color: '#f97316' },
                {
                  label: 'Total Fines',
                  value: `PKR ${Number(driver.total_fines_value ?? 0).toLocaleString()}`,
                  color: hasFines ? '#ef4444' : '#475569',
                  sub: hasFines || hasWarnings
                    ? `${driver.total_fines_count ?? 0} fine(s) · ${driver.total_warnings_count ?? 0} warning(s)`
                    : 'No penalties',
                },
                { label: 'Member Since', value: driver.join_date ? new Date(driver.join_date).getFullYear() : '–', color: '#06b6d4' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ color: '#475569', fontSize: 11 }}>{item.label}</div>
                  <div style={{ color: item.color, fontWeight: 700, fontSize: item.label === 'Total Fines' ? 16 : 20 }}>{item.value}</div>
                  {(item as any).sub && <div style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>{(item as any).sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Safety score ring */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: 90, height: 90 }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="45" cy="45" r="36"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 36 * driver.safety_score / 100} ${2 * Math.PI * 36}`}
                  transform="rotate(-90 45 45)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Shield size={14} color={scoreColor} />
                <div style={{ color: scoreColor, fontWeight: 800, fontSize: 16 }}>{driver.safety_score}</div>
              </div>
            </div>
            <div style={{ color: '#64748b', fontSize: 11 }}>Safety Score</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Charts */}
        <div className="space-y-4">
          {/* Radar */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Performance Radar</div>
            <div style={{ color: '#475569', fontSize: 11, marginBottom: 12 }}>Driver capability overview</div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Radar name="Score" dataKey="A" stroke={driver.avatar_color} fill={driver.avatar_color} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Violation breakdown */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Violation Breakdown</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={violationBarData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {violationBarData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Route info + details */}
        <div className="space-y-4">
          {/* Assigned route */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Map size={16} color={routeColor} />
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>Assigned Route</div>
              <span className="ml-auto px-2 py-0.5 rounded text-xs font-semibold" style={{ background: `${routeColor}15`, color: routeColor }}>
                {ROUTE_LABELS[driver.route_type as keyof typeof ROUTE_LABELS] || driver.route_type}
              </span>
            </div>
            <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{driver.route_name || 'No route assigned'}</div>
            {driver.bus_number && (
              <div style={{ color: '#64748b', fontSize: 12, marginBottom: 12 }}>Bus: {driver.bus_number}</div>
            )}
          </div>

          {/* Driver details */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Driver Details</div>
            <div className="space-y-3">
              {[
                { icon: Hash, label: 'License Number', value: driver.license_number },
                { icon: Calendar, label: 'Join Date', value: driver.join_date ? new Date(driver.join_date).toLocaleDateString() : '–' },
                { icon: Clock, label: driver.status === 'suspended' ? 'Suspended Since' : 'Status', value: driver.status === 'suspended' && driver.last_active ? new Date(driver.last_active).toLocaleDateString() : driver.status === 'suspended' ? 'Suspended' : 'Active' },
                { icon: TrendingUp, label: 'Experience', value: `${driver.experience_years || 0} years` },
                { icon: Award, label: 'Ranking', value: `#${driver.rank} globally` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <Icon size={13} color="#6366f1" />
                  </div>
                  <div>
                    <div style={{ color: '#475569', fontSize: 11 }}>{label}</div>
                    <div style={{ color: '#f1f5f9', fontSize: 13 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Violation log */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>Violation History</div>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            >
              {driverViolations.length} total
            </span>
          </div>

          {driverViolations.length === 0 ? (
            <div className="text-center py-10">
              <Shield size={28} color="#10b981" className="mx-auto mb-2" />
              <div style={{ color: '#10b981', fontWeight: 600 }}>No violations recorded</div>
              <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>Excellent driver!</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {driverViolations.map(v => {
                const Icon = violationIcons[v.violation_type] || AlertTriangle;
                const color = VIOLATION_COLORS[v.violation_type] || '#6366f1';
                const statusColors: Record<string, string> = {
                  pending: '#f59e0b', reviewed: '#10b981', flagged: '#ef4444',
                };
                const hasPenalty = !!(v as any).penalty_type;
                return (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl"
                    style={{ background: `${color}0a`, border: `1px solid ${color}20` }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                        <Icon size={14} color={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }}>
                            {VIOLATION_LABELS[v.violation_type] || v.violation_label}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{ background: `${statusColors[v.status] || '#6366f1'}15`, color: statusColors[v.status] || '#6366f1' }}
                            >
                              {v.status}
                            </span>
                          </div>
                        </div>
                        <div style={{ color: '#64748b', fontSize: 11 }}>{v.detection_date} at {v.start_time}</div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2">
                            <div style={{ color: '#475569', fontSize: 11 }}>
                              {v.detection_date ? new Date(v.detection_date).toLocaleDateString() : ''}
                            </div>
                            <PenaltyBadge penalty_type={(v as any).penalty_type} fine_amount={(v as any).fine_amount} />
                          </div>
                          {v.confidence && (
                            <div style={{ color: color, fontSize: 11, fontWeight: 600 }}>{v.confidence}% conf.</div>
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
      </div>
    </div>
  );
}
