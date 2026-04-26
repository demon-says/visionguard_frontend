import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Search, Filter, AlertTriangle, CheckCircle, Flag,
  Phone, Glasses, Brain, Cigarette, SlidersHorizontal,
  Download, RefreshCw, Eye, ChevronLeft, ChevronRight,
  Gavel, X
} from 'lucide-react';
import { toast } from 'sonner';
import { VIOLATION_COLORS, VIOLATION_LABELS, FINE_AMOUNTS, FINE_THRESHOLD } from '../data/constants';
import { useViolations, useUpdateViolation, useIssuePenalty } from '../api/hooks';

const violationIcons: Record<string, any> = {
  phone: Phone,
  mobile: Phone,
  sunglasses: Glasses,
  drowsiness: Brain,
  drowsy: Brain,
  smoking: Cigarette,
};

const statusConfig = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle, label: 'Pending' },
  reviewed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, label: 'Reviewed' },
  flagged: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: Flag, label: 'Flagged' },
};

const LoadingSkeleton = ({ height = 48 }: { height?: number }) => (
  <div className="animate-pulse rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', height }} />
);

// Penalty badge component
function PenaltyBadge({ penalty_type, fine_amount }: {
  penalty_type?: string | null;
  fine_amount?: number | null;
}) {
  if (!penalty_type) {
    return <span style={{ color: '#475569', fontSize: 11 }}>—</span>;
  }
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

// Confirmation dialog
function PenaltyConfirmDialog({
  violation,
  onConfirm,
  onCancel,
  loading,
}: {
  violation: { id: string; driver_name: string; violation_type: string; total_violations?: number };
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  // We don't have exact violation count in list view, so show the fine amount preview
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
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
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
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            {loading ? 'Processing...' : 'Confirm Penalty'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Violations() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [page, setPage] = useState(1);
  const limit = 20;

  // Penalty confirmation dialog state
  const [penaltyTarget, setPenaltyTarget] = useState<{
    id: string; driver_name: string; violation_type: string;
  } | null>(null);

  const filters = useMemo(() => ({
    type: filterType !== 'all' ? filterType : undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    driverName: search || undefined,
    page,
    limit,
  }), [filterType, filterStatus, search, page, limit]);

  const { data: result, loading, refetch } = useViolations(filters);
  const { update: updateViolation, loading: updating } = useUpdateViolation();
  const { issue: issuePenalty, loading: issuingPenalty } = useIssuePenalty();

  const violations = result?.data || [];
  const meta = result?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  const markReviewed = async (id: string) => {
    try {
      await updateViolation(id, { status: 'reviewed', reviewedBy: 'Admin' });
      toast.success('Violation marked as reviewed');
      refetch();
    } catch {
      toast.error('Failed to update violation');
    }
  };

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

  // Compute counts from current page data (approximate)
  const totalCount = meta?.total ?? violations.length;

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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Violations', value: totalCount, color: '#6366f1', icon: AlertTriangle },
          { label: 'Flagged', value: violations.filter(v => v.status === 'flagged').length, color: '#ef4444', icon: Flag },
          { label: 'Pending Review', value: violations.filter(v => v.status === 'pending').length, color: '#f59e0b', icon: AlertTriangle },
          { label: 'Reviewed', value: violations.filter(v => v.status === 'reviewed').length, color: '#10b981', icon: CheckCircle },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: `${item.color}0d`, border: `1px solid ${item.color}25` }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${item.color}20` }}>
              <item.icon size={18} color={item.color} />
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 11 }}>{item.label}</div>
              <div style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700 }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Violation type summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {([
          { key: 'mobile', label: 'Phone Usage', icon: Phone },
          { key: 'sunglasses', label: 'Sunglasses', icon: Glasses },
          { key: 'drowsy', label: 'Drowsiness', icon: Brain },
          { key: 'smoking', label: 'Smoking', icon: Cigarette },
        ]).map(({ key, label, icon: Icon }) => {
          const count = violations.filter(v => v.violation_type === key).length;
          const color = VIOLATION_COLORS[key];
          const pct = violations.length ? Math.round(count / violations.length * 100) : 0;
          return (
            <div
              key={key}
              className="p-4 rounded-xl cursor-pointer transition-all hover:opacity-80"
              style={{
                background: filterType === key ? `${color}15` : `${color}08`,
                border: filterType === key ? `1px solid ${color}50` : `1px solid ${color}20`,
              }}
              onClick={() => { setFilterType(filterType === key ? 'all' : key); setPage(1); }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>{label}</div>
                  <div style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700 }}>{count}</div>
                </div>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>{pct}% of total</div>
            </div>
          );
        })}
      </div>

      {/* Filters & Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Filters bar */}
        <div className="p-4 flex flex-wrap items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Search size={15} color="#475569" />
            <input
              type="text"
              placeholder="Search driver name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none flex-1 text-sm"
              style={{ color: '#f1f5f9' }}
            />
          </div>

          <div className="flex gap-1">
            {['all', 'flagged', 'pending', 'reviewed'].map(s => {
              const config = s === 'all' ? null : statusConfig[s as keyof typeof statusConfig];
              return (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setPage(1); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: filterStatus === s ? (config ? `${config.color}20` : 'rgba(99,102,241,0.2)') : 'rgba(255,255,255,0.04)',
                    color: filterStatus === s ? (config?.color || '#a5b4fc') : '#64748b',
                    border: filterStatus === s ? `1px solid ${config?.color || '#6366f1'}40` : '1px solid transparent',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>



          <div style={{ color: '#475569', fontSize: 12 }}>
            Showing {violations.length} of {totalCount}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Type', 'Driver', 'Route', 'Date & Time', 'Status', 'Penalty', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><LoadingSkeleton height={48} /></td></tr>
                ))
              ) : violations.map((v, i) => {
                const Icon = violationIcons[v.violation_type] || AlertTriangle;
                const color = VIOLATION_COLORS[v.violation_type] || '#6366f1';
                const sc = statusConfig[v.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = sc.icon;
                const hasPenalty = !!v.penalty_type;
                return (
                  <tr
                    key={v.id}
                    className="transition-all hover:opacity-90"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                  >
                    {/* Type */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                          <Icon size={14} color={color} />
                        </div>
                        <span style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {VIOLATION_LABELS[v.violation_type] || v.violation_label}
                        </span>
                      </div>
                    </td>

                    {/* Driver */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/drivers/${v.driver_id}`}
                        className="font-semibold hover:opacity-80 transition-opacity"
                        style={{ color: '#a5b4fc', fontSize: 13 }}
                      >
                        {v.driver_name}
                      </Link>
                    </td>

                    {/* Route */}
                    <td className="px-4 py-3">
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>{v.route_name || '–'}</div>
                      {v.bus_number && <div style={{ color: '#475569', fontSize: 11 }}>Bus: {v.bus_number}</div>}
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-3">
                      <div style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {v.detection_date ? new Date(v.detection_date).toLocaleDateString() : '–'}
                      </div>
                      <div style={{ color: '#475569', fontSize: 11 }}>
                        {v.start_time || '–'}
                      </div>
                    </td>


                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit" style={{ background: sc.bg }}>
                        <StatusIcon size={11} color={sc.color} />
                        <span style={{ color: sc.color, fontSize: 11, fontWeight: 600 }}>{sc.label}</span>
                      </div>
                    </td>

                    {/* Penalty */}
                    <td className="px-4 py-3">
                      <PenaltyBadge penalty_type={v.penalty_type} fine_amount={v.fine_amount} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/drivers/${v.driver_id}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}
                          title="View Driver"
                        >
                          <Eye size={12} />
                        </Link>
                        {v.status !== 'reviewed' && (
                          <button
                            onClick={() => markReviewed(v.id)}
                            disabled={updating}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-40"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                            title="Mark Reviewed"
                          >
                            <CheckCircle size={12} />
                          </button>
                        )}
                        {/* Issue Penalty button */}
                        <button
                          onClick={() => setPenaltyTarget({ id: v.id, driver_name: v.driver_name, violation_type: v.violation_type })}
                          disabled={hasPenalty}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                          style={{
                            background: hasPenalty ? 'rgba(255,255,255,0.03)' : 'rgba(245,158,11,0.1)',
                            color: hasPenalty ? '#475569' : '#f59e0b',
                          }}
                          title={hasPenalty ? 'Penalty already issued' : 'Issue Penalty'}
                        >
                          <Gavel size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && violations.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle size={32} color="#10b981" className="mx-auto mb-3" />
            <div style={{ color: '#10b981', fontWeight: 600 }}>No violations match your filters.</div>
          </div>
        )}

        {/* Pagination */}
        {meta && totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ color: '#475569', fontSize: 12 }}>
              Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, meta.total)} of {meta.total}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2 py-1 rounded-lg text-xs transition-all hover:opacity-80 disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: page === p ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                      color: page === p ? '#a5b4fc' : '#64748b',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 rounded-lg text-xs transition-all hover:opacity-80 disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
