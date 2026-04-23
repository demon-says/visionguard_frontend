import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp,
  Phone, Glasses, Brain, Cigarette, ArrowRight, Clock, Map, Loader2,
  Banknote, Gavel
} from 'lucide-react';
import { VIOLATION_COLORS, VIOLATION_LABELS } from '../data/constants';
import {
  useDashboardSummaryPolled, useRecentViolations, useTopDrivers,
  useBottomDrivers, useWeeklyTrend, useDashboardViolationMix,
} from '../api/hooks';

const StatCard = ({
  icon: Icon, label, value, sub, color, trend, trendUp
}: {
  icon: any; label: string; value: string | number; sub: string;
  color: string; trend?: string; trendUp?: boolean;
}) => (
  <div
    className="rounded-2xl p-5 flex flex-col gap-3"
    style={{
      background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <div className="flex items-start justify-between">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: `${color}20` }}
      >
        <Icon size={22} color={color} />
      </div>
      {trend && (
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
          style={{
            background: trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: trendUp ? '#10b981' : '#ef4444',
          }}
        >
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      )}
    </div>
    <div>
      <div style={{ color: '#94a3b8', fontSize: 13 }}>{label}</div>
      <div style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
      <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>{sub}</div>
    </div>
  </div>
);

const violationIcons: Record<string, any> = {
  phone: Phone,
  mobile: Phone,
  sunglasses: Glasses,
  drowsiness: Brain,
  drowsy: Brain,
  smoking: Cigarette,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl p-3" style={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)' }}>
        <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2" style={{ fontSize: 12 }}>
            <div className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
            <span style={{ color: '#94a3b8' }}>{p.name}:</span>
            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const LoadingSkeleton = ({ height = 200 }: { height?: number }) => (
  <div className="animate-pulse rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', height }} />
);

export default function Dashboard() {
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');

  const { data: summaryRes, loading: summaryLoading } = useDashboardSummaryPolled();
  const { data: recentRes, loading: recentLoading } = useRecentViolations(5);
  const { data: topRes, loading: topLoading } = useTopDrivers(3);
  const { data: bottomRes, loading: bottomLoading } = useBottomDrivers(3);
  const { data: trendRes, loading: trendLoading } = useWeeklyTrend();
  const { data: mixRes, loading: mixLoading } = useDashboardViolationMix();

  const summary = summaryRes?.data;
  const recentViolations = recentRes?.data || [];
  const topDrivers = topRes?.data || [];
  const bottomDrivers = bottomRes?.data || [];
  const weeklyTrendData = trendRes?.data || [];
  const violationBreakdown = mixRes?.data || [];

  // Transform weekly trend for day-of-week labels
  const weeklyChartData = weeklyTrendData.map(item => ({
    day: new Date(item.detection_date).toLocaleDateString('en-US', { weekday: 'short' }),
    phone: item.phone,
    sunglasses: item.sunglasses,
    drowsiness: item.drowsy,
    smoking: item.smoking,
    total: item.total,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryLoading ? (
          <>
            <LoadingSkeleton height={140} />
            <LoadingSkeleton height={140} />
            <LoadingSkeleton height={140} />
            <LoadingSkeleton height={140} />
            <LoadingSkeleton height={140} />
            <LoadingSkeleton height={140} />
          </>
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Active Drivers"
              value={summary?.active_drivers ?? 0}
              sub={`${summary?.total_drivers ?? 0} total registered`}
              color="#6366f1"
            />
            <StatCard
              icon={AlertTriangle}
              label="Total Violations"
              value={summary?.total_violations ?? 0}
              sub={`${summary?.pending_violations ?? 0} pending review`}
              color="#ef4444"
            />
            <StatCard
              icon={Gavel}
              label="Fines Issued"
              value={summary?.total_fines_issued ?? 0}
              sub={`${summary?.total_warnings_issued ?? 0} warnings`}
              color="#f97316"
            />
            <StatCard
              icon={Banknote}
              label="Total Fine Value"
              value={`PKR ${Number(summary?.total_fines_value ?? 0).toLocaleString()}`}
              sub="all time"
              color="#eab308"
            />
            <StatCard
              icon={ShieldCheck}
              label="Avg Safety Score"
              value={`${summary?.avg_safety_score ?? 0}%`}
              sub="Across all drivers"
              color="#10b981"
            />
            <StatCard
              icon={Map}
              label="Active Routes"
              value={summary?.total_routes ?? 0}
              sub={`${summary?.flagged_violations ?? 0} flagged violations`}
              color="#06b6d4"
            />
          </>
        )}
      </div>

      {/* Violation type quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {([
          { key: 'mobile', label: 'Phone Usage', icon: Phone, countKey: 'total_phone' as const },
          { key: 'drowsy', label: 'Drowsiness', icon: Brain, countKey: 'total_drowsy' as const },
          { key: 'sunglasses', label: 'Sunglasses', icon: Glasses, countKey: 'total_sunglasses' as const },
          { key: 'smoking', label: 'Smoking', icon: Cigarette, countKey: 'total_smoking' as const },
        ]).map(({ key, label, icon: Icon, countKey }) => {
          const count = summary?.[countKey] ?? 0;
          const color = VIOLATION_COLORS[key];
          return (
            <div
              key={key}
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: `${color}0d`, border: `1px solid ${color}25` }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>{label}</div>
                <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 20 }}>{count}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main chart */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>Violation Trends</div>
              <div style={{ color: '#475569', fontSize: 12 }}>Detection events over time</div>
            </div>
            <div className="flex gap-2">
              {(['weekly', 'monthly'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: chartView === v ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                    color: chartView === v ? '#a5b4fc' : '#64748b',
                    border: chartView === v ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                  }}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {trendLoading ? (
            <LoadingSkeleton height={220} />
          ) : chartView === 'weekly' ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyChartData} barSize={10} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="phone" name="Phone" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                <Bar dataKey="sunglasses" name="Sunglasses" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                <Bar dataKey="drowsiness" name="Drowsiness" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="smoking" name="Smoking" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyChartData}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="Total" stroke="#6366f1" fill="url(#totalGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Violation Types</div>
          <div style={{ color: '#475569', fontSize: 12, marginBottom: 16 }}>Distribution breakdown</div>
          {mixLoading ? (
            <LoadingSkeleton height={160} />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={violationBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                    {violationBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val} violations`, name]} contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {violationBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>{item.name}</span>
                    </div>
                    <span style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent violations */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>Recent Violations</div>
              <div style={{ color: '#475569', fontSize: 12 }}>AI-detected events</div>
            </div>
            <Link
              to="/violations"
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ color: '#a5b4fc', background: 'rgba(99,102,241,0.1)' }}
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {recentLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <LoadingSkeleton key={i} height={56} />)}
            </div>
          ) : recentViolations.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheck size={28} color="#10b981" className="mx-auto mb-2" />
              <div style={{ color: '#10b981', fontWeight: 600 }}>No recent violations</div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentViolations.map(v => {
                const Icon = violationIcons[v.violation_type] || AlertTriangle;
                const color = VIOLATION_COLORS[v.violation_type] || '#6366f1';
                const statusColors: Record<string, string> = {
                  pending: '#f59e0b',
                  reviewed: '#10b981',
                  flagged: '#ef4444',
                };
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{v.driver_name}</div>
                      <div style={{ color: '#475569', fontSize: 11 }}>
                        {VIOLATION_LABELS[v.violation_type] || v.violation_label} • {v.route_name || 'Unknown route'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: `${statusColors[v.status] || '#6366f1'}15`, color: statusColors[v.status] || '#6366f1' }}
                      >
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </div>
                      {v.confidence && (
                        <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>{v.confidence}% conf.</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Driver leaderboard + worst */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>Driver Rankings</div>
            <div style={{ color: '#475569', fontSize: 12 }}>Top & bottom performers</div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-3 rounded-full" style={{ background: '#10b981' }} />
              <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>Top Performers</span>
            </div>
            {topLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <LoadingSkeleton key={i} height={48} />)}</div>
            ) : (
              <div className="space-y-2">
                {topDrivers.map(d => (
                  <Link
                    key={d.id}
                    to={`/drivers/${d.id}`}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all hover:opacity-80"
                    style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: d.avatar_color + '25', color: d.avatar_color }}
                    >
                      {d.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }} className="truncate">{d.name}</div>
                      <div style={{ color: '#475569', fontSize: 11 }}>Score: {d.safety_score}%</div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#10b98120', color: '#10b981' }}
                    >
                      #{d.rank}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-3 rounded-full" style={{ background: '#ef4444' }} />
              <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}>Needs Attention</span>
            </div>
            {bottomLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <LoadingSkeleton key={i} height={48} />)}</div>
            ) : (
              <div className="space-y-2">
                {bottomDrivers.map(d => (
                  <Link
                    key={d.id}
                    to={`/drivers/${d.id}`}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all hover:opacity-80"
                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: d.avatar_color + '25', color: d.avatar_color }}
                    >
                      {d.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }} className="truncate">{d.name}</div>
                      <div style={{ color: '#475569', fontSize: 11 }}>{d.total_violations} violations</div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#ef444420', color: '#ef4444' }}
                    >
                      #{d.rank}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/drivers"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            View All Drivers <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}