import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Search, Filter, ChevronUp, ChevronDown, Users,
  ShieldCheck, AlertTriangle, ArrowUpRight, Phone,
  Glasses, Brain, Cigarette, Medal, Star,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { ROUTE_COLORS, ROUTE_LABELS, VIOLATION_COLORS } from '../data/constants';
import { useDrivers } from '../api/hooks';
import type { DriverStats } from '../api/types';

const safetyColor = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const statusStyles: Record<string, { bg: string; color: string }> = {
  active: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  inactive: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  suspended: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

const rankMedal = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

const LoadingSkeleton = ({ height = 48 }: { height?: number }) => (
  <div className="animate-pulse rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', height }} />
);

export default function Drivers() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRoute, setFilterRoute] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const limit = 20;

  const filters = useMemo(() => ({
    status: filterStatus !== 'all' ? filterStatus : undefined,
    routeType: filterRoute !== 'all' ? filterRoute : undefined,
    search: search || undefined,
    sortBy,
    order: sortDir,
    page,
    limit,
  }), [filterStatus, filterRoute, search, sortBy, sortDir, page, limit]);

  const { data: result, loading, error } = useDrivers(filters);

  const drivers = result?.data || [];
  const meta = result?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
    setPage(1);
  };

  // Compute stats from current data (may not be all drivers if filtered)
  const totalCount = meta?.total ?? drivers.length;

  const SortIcon = ({ col }: { col: string }) => (
    <span className="ml-1 opacity-50">
      {sortBy === col ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronUp size={12} />}
    </span>
  );

  return (
    <div className="p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Drivers', value: totalCount, color: '#6366f1', icon: Users },
          { label: 'Active', value: drivers.filter(d => d.status === 'active').length, color: '#10b981', icon: ShieldCheck },
          { label: 'Suspended', value: drivers.filter(d => d.status === 'suspended').length, color: '#ef4444', icon: AlertTriangle },
          { label: 'Avg Safety Score', value: drivers.length ? `${Math.round(drivers.reduce((s, d) => s + d.safety_score, 0) / drivers.length)}%` : '–', color: '#f59e0b', icon: Star },
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

      {/* Filters */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Search size={15} color="#475569" />
            <input
              type="text"
              placeholder="Search drivers or license..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none flex-1 text-sm"
              style={{ color: '#f1f5f9' }}
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {['all', 'active', 'inactive', 'suspended'].map(s => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: filterStatus === s ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  color: filterStatus === s ? '#a5b4fc' : '#64748b',
                  border: filterStatus === s ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Route type filter */}
          <div className="flex gap-1">
            {['all', 'demanding', 'moderate', 'simple'].map(r => (
              <button
                key={r}
                onClick={() => { setFilterRoute(r); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: filterRoute === r ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  color: filterRoute === r ? '#a5b4fc' : '#64748b',
                  border: filterRoute === r ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Rank', col: 'rank', w: 60 },
                  { label: 'Driver', col: 'name', w: 200 },
                  { label: 'Safety Score', col: 'score', w: 140 },
                  { label: 'Violations', col: 'violations', w: 160 },
                  { label: 'Route Type', col: null as string | null, w: 120 },
                  { label: 'Status', col: null as string | null, w: 100 },
                  { label: 'Assigned Route', col: null as string | null, w: 200 },
                  { label: '', col: null as string | null, w: 60 },
                ].map(({ label, col, w }) => (
                  <th
                    key={label || 'action'}
                    className={`text-left px-4 py-3 ${col ? 'cursor-pointer hover:opacity-80 select-none' : ''}`}
                    style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: w }}
                    onClick={col ? () => handleSort(col) : undefined}
                  >
                    <div className="flex items-center">
                      {label}
                      {col && <SortIcon col={col} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><LoadingSkeleton height={48} /></td></tr>
                ))
              ) : drivers.map((driver, i) => {
                const medal = rankMedal(driver.rank);
                const scoreColor = safetyColor(driver.safety_score);
                const routeColor = ROUTE_COLORS[driver.route_type as keyof typeof ROUTE_COLORS] || '#6b7280';
                const statusStyle = statusStyles[driver.status] || statusStyles.active;

                return (
                  <tr
                    key={driver.id}
                    className="transition-all hover:opacity-90"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                  >
                    {/* Rank */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {medal ? (
                          <span style={{ fontSize: 18 }}>{medal}</span>
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}
                          >
                            {driver.rank}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Driver */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ background: driver.avatar_color + '25', color: driver.avatar_color }}
                        >
                          {driver.initials}
                        </div>
                        <div>
                          <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{driver.name}</div>
                          <div style={{ color: '#475569', fontSize: 11 }}>{driver.license_number}</div>
                        </div>
                      </div>
                    </td>

                    {/* Safety score */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', maxWidth: 70 }}>
                          <div className="h-full rounded-full" style={{ width: `${driver.safety_score}%`, background: scoreColor }} />
                        </div>
                        <span style={{ color: scoreColor, fontSize: 13, fontWeight: 700 }}>{driver.safety_score}%</span>
                      </div>
                    </td>

                    {/* Violations breakdown */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {[
                          { type: 'phone', count: driver.phone_violations, icon: Phone },
                          { type: 'sunglasses', count: driver.sunglasses_violations, icon: Glasses },
                          { type: 'drowsiness', count: driver.drowsiness_violations, icon: Brain },
                          { type: 'smoking', count: driver.smoking_violations, icon: Cigarette },
                        ].map(({ type, count, icon: Icon }) => (
                          <div
                            key={type}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                            style={{
                              background: count > 0 ? `${VIOLATION_COLORS[type]}15` : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${count > 0 ? VIOLATION_COLORS[type] + '30' : 'transparent'}`,
                              opacity: count === 0 ? 0.4 : 1,
                            }}
                          >
                            <Icon size={10} color={count > 0 ? VIOLATION_COLORS[type] : '#475569'} />
                            <span style={{ color: count > 0 ? VIOLATION_COLORS[type] : '#475569', fontSize: 11, fontWeight: 600 }}>{count}</span>
                          </div>
                        ))}
                        <span style={{ color: '#64748b', fontSize: 11, marginLeft: 4 }}>= {driver.total_violations}</span>
                      </div>
                    </td>

                    {/* Route type */}
                    <td className="px-4 py-4">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: `${routeColor}15`, color: routeColor }}
                      >
                        {ROUTE_LABELS[driver.route_type as keyof typeof ROUTE_LABELS] || driver.route_type}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                      </span>
                    </td>

                    {/* Route name */}
                    <td className="px-4 py-4">
                      <div style={{ color: '#94a3b8', fontSize: 12 }} className="truncate max-w-[180px]">{driver.route_name}</div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4">
                      <Link
                        to={`/drivers/${driver.id}`}
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && drivers.length === 0 && (
          <div className="text-center py-12">
            <Users size={32} color="#334155" className="mx-auto mb-3" />
            <div style={{ color: '#475569' }}>No drivers match your filters.</div>
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
