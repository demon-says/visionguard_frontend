import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  Search, Filter, AlertTriangle, CheckCircle, Flag,
  Phone, Glasses, Brain, Cigarette, SlidersHorizontal,
  Download, RefreshCw, Eye
} from 'lucide-react';
import { violations, VIOLATION_COLORS, VIOLATION_LABELS, ViolationType } from '../data/mockData';

const violationIcons: Record<string, any> = {
  phone: Phone,
  sunglasses: Glasses,
  drowsiness: Brain,
  smoking: Cigarette,
};

const statusConfig = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle, label: 'Pending' },
  reviewed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, label: 'Reviewed' },
  flagged: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: Flag, label: 'Flagged' },
};

export default function Violations() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [localViolations, setLocalViolations] = useState(violations);

  const markReviewed = (id: string) => {
    setLocalViolations(prev => prev.map(v => v.id === id ? { ...v, status: 'reviewed' as any } : v));
  };

  const filtered = localViolations.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.driverName.toLowerCase().includes(q) || v.location.toLowerCase().includes(q) || v.route.toLowerCase().includes(q);
    const matchType = filterType === 'all' || v.type === filterType;
    const matchStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const pendingCount = localViolations.filter(v => v.status === 'pending').length;
  const flaggedCount = localViolations.filter(v => v.status === 'flagged').length;
  const reviewedCount = localViolations.filter(v => v.status === 'reviewed').length;

  return (
    <div className="p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Violations', value: localViolations.length, color: '#6366f1', icon: AlertTriangle },
          { label: 'Flagged', value: flaggedCount, color: '#ef4444', icon: Flag },
          { label: 'Pending Review', value: pendingCount, color: '#f59e0b', icon: AlertTriangle },
          { label: 'Reviewed', value: reviewedCount, color: '#10b981', icon: CheckCircle },
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
        {(['phone', 'sunglasses', 'drowsiness', 'smoking'] as ViolationType[]).map(type => {
          const count = localViolations.filter(v => v.type === type).length;
          const Icon = violationIcons[type];
          const color = VIOLATION_COLORS[type];
          const pct = Math.round(count / localViolations.length * 100);
          return (
            <div
              key={type}
              className="p-4 rounded-xl cursor-pointer transition-all hover:opacity-80"
              style={{
                background: filterType === type ? `${color}15` : `${color}08`,
                border: filterType === type ? `1px solid ${color}50` : `1px solid ${color}20`,
              }}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>{VIOLATION_LABELS[type]}</div>
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
              placeholder="Search driver, location, route..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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
                  onClick={() => setFilterStatus(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: filterStatus === s ? (config ? `${config.color}20` : 'rgba(99,102,241,0.2)') : 'rgba(255,255,255,0.04)',
                    color: filterStatus === s ? (config?.color || '#a5b4fc') : '#64748b',
                    border: filterStatus === s ? `1px solid ${config?.color || '#6366f1'}40` : '1px solid transparent',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== 'all' && (
                    <span className="px-1 rounded" style={{ background: 'rgba(255,255,255,0.1)', fontSize: 10 }}>
                      {localViolations.filter(v => v.status === s).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ color: '#475569', fontSize: 12 }}>
            Showing {filtered.length} of {localViolations.length}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Type', 'Driver', 'Location & Route', 'Timestamp', 'Confidence', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => {
                const Icon = violationIcons[v.type];
                const color = VIOLATION_COLORS[v.type];
                const sc = statusConfig[v.status as keyof typeof statusConfig];
                const StatusIcon = sc.icon;
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
                          {VIOLATION_LABELS[v.type]}
                        </span>
                      </div>
                    </td>

                    {/* Driver */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/drivers/${v.driverId}`}
                        className="font-semibold hover:opacity-80 transition-opacity"
                        style={{ color: '#a5b4fc', fontSize: 13 }}
                      >
                        {v.driverName}
                      </Link>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3">
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>{v.location.split(',')[0]}</div>
                      <div style={{ color: '#475569', fontSize: 11 }}>{v.route}</div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3">
                      <div style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {new Date(v.timestamp).toLocaleDateString()}
                      </div>
                      <div style={{ color: '#475569', fontSize: 11 }}>
                        {new Date(v.timestamp).toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Confidence */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${v.confidence}%`,
                              background: v.confidence >= 90 ? '#10b981' : v.confidence >= 80 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>{v.confidence}%</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit" style={{ background: sc.bg }}>
                        <StatusIcon size={11} color={sc.color} />
                        <span style={{ color: sc.color, fontSize: 11, fontWeight: 600 }}>{sc.label}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/drivers/${v.driverId}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}
                          title="View Driver"
                        >
                          <Eye size={12} />
                        </Link>
                        {v.status !== 'reviewed' && (
                          <button
                            onClick={() => markReviewed(v.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                            title="Mark Reviewed"
                          >
                            <CheckCircle size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle size={32} color="#10b981" className="mx-auto mb-3" />
            <div style={{ color: '#10b981', fontWeight: 600 }}>No violations match your filters.</div>
          </div>
        )}
      </div>
    </div>
  );
}
