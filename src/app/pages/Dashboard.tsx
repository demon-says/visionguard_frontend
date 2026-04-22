import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp,
  Phone, Glasses, Brain, Cigarette, ArrowRight, Clock, Map
} from 'lucide-react';
import {
  drivers, violations, weeklyViolationData, violationBreakdown,
  monthlyViolationData, VIOLATION_COLORS, VIOLATION_LABELS,
} from '../data/mockData';

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
  sunglasses: Glasses,
  drowsiness: Brain,
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

export default function Dashboard() {
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');

  const totalViolationsToday = violations.filter(v =>
    v.timestamp.startsWith('2026-04-18')
  ).length;

  const pendingAlerts = violations.filter(v => v.status === 'pending' || v.status === 'flagged').length;
  const avgSafetyScore = Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length);
  const activeDrivers = drivers.filter(d => d.status === 'active').length;

  const recentViolations = violations.slice(0, 5);
  const topDrivers = drivers.filter(d => d.rank <= 3);
  const bottomDrivers = drivers.filter(d => d.rank >= 8).slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Active Drivers"
          value={activeDrivers}
          sub={`${drivers.length} total registered`}
          color="#6366f1"
          trend="+2 this month"
          trendUp
        />
        <StatCard
          icon={AlertTriangle}
          label="Violations Today"
          value={totalViolationsToday}
          sub="Out of 18 total this week"
          color="#ef4444"
          trend="-3 vs yesterday"
          trendUp
        />
        <StatCard
          icon={ShieldCheck}
          label="Avg Safety Score"
          value={`${avgSafetyScore}%`}
          sub="Across all drivers"
          color="#10b981"
          trend="+4% this week"
          trendUp
        />
        <StatCard
          icon={Map}
          label="Active Routes"
          value={10}
          sub="3 demanding, 3 moderate"
          color="#06b6d4"
        />
      </div>

      {/* Violation type quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(['phone', 'drowsiness', 'sunglasses', 'smoking'] as const).map(type => {
          const Icon = violationIcons[type];
          const count = violations.filter(v => v.type === type).length;
          const color = VIOLATION_COLORS[type];
          return (
            <div
              key={type}
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: `${color}0d`, border: `1px solid ${color}25` }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>{VIOLATION_LABELS[type]}</div>
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

          {chartView === 'weekly' ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyViolationData} barSize={10} barGap={2}>
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
              <AreaChart data={monthlyViolationData}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
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
          <div className="space-y-2">
            {recentViolations.map(v => {
              const Icon = violationIcons[v.type];
              const color = VIOLATION_COLORS[v.type];
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
                    <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{v.driverName}</div>
                    <div style={{ color: '#475569', fontSize: 11 }}>{VIOLATION_LABELS[v.type]} • {v.location.split(',')[0]}</div>
                  </div>
                  <div className="text-right">
                    <div
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: `${statusColors[v.status]}15`, color: statusColors[v.status] }}
                    >
                      {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                    </div>
                    <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>{v.confidence}% conf.</div>
                  </div>
                </div>
              );
            })}
          </div>
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
                    style={{ background: d.avatarColor + '25', color: d.avatarColor }}
                  >
                    {d.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }} className="truncate">{d.name}</div>
                    <div style={{ color: '#475569', fontSize: 11 }}>Score: {d.safetyScore}%</div>
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
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-3 rounded-full" style={{ background: '#ef4444' }} />
              <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}>Needs Attention</span>
            </div>
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
                    style={{ background: d.avatarColor + '25', color: d.avatarColor }}
                  >
                    {d.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }} className="truncate">{d.name}</div>
                    <div style={{ color: '#475569', fontSize: 11 }}>{d.totalViolations} violations</div>
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