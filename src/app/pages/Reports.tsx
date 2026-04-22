import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Award, AlertTriangle, Users, Shield } from 'lucide-react';
import {
  useReportKPIs, useDailyTrend, useMonthlyComparison,
  useHourlyPattern, useReportViolationMix, useDriverScores,
} from '../api/hooks';

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

export default function Reports() {
  const { data: kpiRes, loading: kpiLoading } = useReportKPIs();
  const { data: trendRes, loading: trendLoading } = useDailyTrend(30);
  const { data: compRes, loading: compLoading } = useMonthlyComparison();
  const { data: hourlyRes, loading: hourlyLoading } = useHourlyPattern();
  const { data: mixRes, loading: mixLoading } = useReportViolationMix();
  const { data: scoresRes, loading: scoresLoading } = useDriverScores();

  const kpis = kpiRes?.data;
  const monthlyTrend = trendRes?.data || [];
  const comparison = compRes?.data;
  const hourlyData = hourlyRes?.data || [];
  const violationBreakdown = mixRes?.data || [];
  const driverScoreData = scoresRes?.data || [];

  // Transform monthly trend for chart labels
  const trendChartData = monthlyTrend.map(item => ({
    month: new Date(item.detection_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: item.total,
  }));

  // Build comparison data from API
  const comparisonData = comparison ? (() => {
    // Aggregate by week
    const weeks: { week: string; thisMonth: number; lastMonth: number }[] = [];
    const thisMonthArr = comparison.thisMonth || [];
    const lastMonthArr = comparison.lastMonth || [];
    for (let w = 0; w < 4; w++) {
      const start = w * 7;
      const end = (w + 1) * 7;
      weeks.push({
        week: `Week ${w + 1}`,
        thisMonth: thisMonthArr.slice(start, end).reduce((s, d) => s + d.total, 0),
        lastMonth: lastMonthArr.slice(start, end).reduce((s, d) => s + d.total, 0),
      });
    }
    return weeks;
  })() : [];

  // Transform hourly data
  const hourlyChartData = hourlyData.map(h => ({
    hour: String(h.hour).padStart(2, '0'),
    violations: h.total_violations,
  }));

  // Transform driver scores for bar chart
  const driverChartData = driverScoreData.map(d => ({
    name: d.name.split(' ')[0],
    score: d.safety_score,
    violations: d.total_violations,
  }));

  // Total violations for computing percentages
  const totalBreakdown = violationBreakdown.reduce((s, v) => s + v.value, 0) || 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} height={130} />)
        ) : (
          [
            { label: 'Total Violations Logged', value: kpis?.totalViolations ?? 0, color: '#ef4444', icon: AlertTriangle, trend: 'All time', up: true },
            { label: 'Fleet Safety Score', value: `${kpis?.fleetSafetyScore ?? 0}%`, color: '#10b981', icon: Shield, trend: 'Fleet average', up: true },
            { label: 'Drivers Improved', value: `${kpis?.driversImproved ?? 0}`, color: '#6366f1', icon: TrendingUp, trend: 'This month', up: true },
            { label: 'Detection Accuracy', value: `${kpis?.detectionAccuracy ?? 0}%`, color: '#06b6d4', icon: BarChart3, trend: 'AI model precision', up: true },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}20` }}>
                  <item.icon size={18} color={item.color} />
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                  style={{ background: item.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: item.up ? '#10b981' : '#ef4444' }}
                >
                  {item.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {item.trend}
                </div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>{item.label}</div>
              <div style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 700 }}>{item.value}</div>
            </div>
          ))
        )}
      </div>

      {/* Month vs month comparison */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Monthly Violation Trend</div>
          <div style={{ color: '#475569', fontSize: 12, marginBottom: 16 }}>30-day historical overview</div>
          {trendLoading ? (
            <LoadingSkeleton height={220} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendChartData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="Violations" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>This Month vs Last Month</div>
          <div style={{ color: '#475569', fontSize: 12, marginBottom: 16 }}>Weekly comparison</div>
          {compLoading ? (
            <LoadingSkeleton height={220} />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="thisMonth" name="This Month" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                  <Line type="monotone" dataKey="lastMonth" name="Last Month" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: '#ef4444', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-2">
                <div className="flex items-center gap-2"><div className="w-6 h-0.5" style={{ background: '#10b981' }} /><span style={{ color: '#64748b', fontSize: 11 }}>This Month</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-dashed border-t-2" style={{ borderColor: '#ef4444' }} /><span style={{ color: '#64748b', fontSize: 11 }}>Last Month</span></div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hourly + violation type */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Hourly Violation Distribution</div>
          <div style={{ color: '#475569', fontSize: 12, marginBottom: 16 }}>Peak hours for violations</div>
          {hourlyLoading ? (
            <LoadingSkeleton height={200} />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyChartData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="#475569" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={h => `${h}:00`} />
                  <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="violations" name="Violations" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {hourlyChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.violations >= 7 ? '#ef4444' : entry.violations >= 4 ? '#f59e0b' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ color: '#475569', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
                Color indicates severity: <span style={{ color: '#6366f1' }}>●</span> Low, <span style={{ color: '#f59e0b' }}>●</span> Medium, <span style={{ color: '#ef4444' }}>●</span> High
              </div>
            </>
          )}
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Violation Mix</div>
          <div style={{ color: '#475569', fontSize: 12, marginBottom: 12 }}>All-time breakdown</div>
          {mixLoading ? (
            <LoadingSkeleton height={180} />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={violationBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {violationBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
              {violationBreakdown.map(item => (
                <div key={item.name} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }}>{item.value}</span>
                    <span style={{ color: '#475569', fontSize: 11 }}>({Math.round(item.value / totalBreakdown * 100)}%)</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Driver performance table */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Driver Safety Score Overview</div>
        <div style={{ color: '#475569', fontSize: 12, marginBottom: 16 }}>Ranked by performance</div>
        {scoresLoading ? (
          <LoadingSkeleton height={280} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={driverChartData} layout="vertical" barSize={18} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#475569" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Safety Score" radius={[0, 4, 4, 0]}>
                  {driverChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 80 ? '#10b981' : entry.score >= 60 ? '#3b82f6' : entry.score >= 40 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {[
                { label: 'Excellent (≥80)', color: '#10b981' },
                { label: 'Good (60-79)', color: '#3b82f6' },
                { label: 'Fair (40-59)', color: '#f59e0b' },
                { label: 'Poor (<40)', color: '#ef4444' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ background: item.color }} />
                  <span style={{ color: '#64748b', fontSize: 12 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
