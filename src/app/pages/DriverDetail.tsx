import React from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft, Shield, AlertTriangle, Phone, Glasses, Brain,
  Cigarette, Map, Calendar, Hash, Clock, TrendingUp, Award
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import {
  drivers, violations, routes,
  VIOLATION_COLORS, VIOLATION_LABELS, ROUTE_COLORS, ROUTE_LABELS
} from '../data/mockData';

const safetyColor = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const violationIcons: Record<string, any> = {
  phone: Phone,
  sunglasses: Glasses,
  drowsiness: Brain,
  smoking: Cigarette,
};

export default function DriverDetail() {
  const { id } = useParams<{ id: string }>();
  const driver = drivers.find(d => d.id === id);

  if (!driver) {
    return (
      <div className="p-6 text-center">
        <div style={{ color: '#f1f5f9', fontSize: 18 }}>Driver not found.</div>
        <Link to="/drivers" className="text-indigo-400 underline mt-2 inline-block">Back to Drivers</Link>
      </div>
    );
  }

  const route = routes.find(r => r.id === driver.assignedRouteId);
  const driverViolations = violations.filter(v => v.driverId === driver.id);
  const scoreColor = safetyColor(driver.safetyScore);
  const routeColor = ROUTE_COLORS[driver.routeType];

  const statusStyles: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    inactive: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    suspended: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  };
  const statusStyle = statusStyles[driver.status];

  // Radar data for skills
  const radarData = [
    { subject: 'Punctuality', A: 90 - driver.totalViolations * 2 },
    { subject: 'Focus', A: driver.safetyScore },
    { subject: 'Safety', A: driver.safetyScore - 5 },
    { subject: 'Compliance', A: Math.max(20, 100 - driver.totalViolations * 8) },
    { subject: 'Experience', A: Math.min(100, driver.experience * 8) },
  ];

  // Violation history bar data
  const violationBarData = [
    { name: 'Phone', value: driver.violations.phone, color: VIOLATION_COLORS.phone },
    { name: 'Sunglasses', value: driver.violations.sunglasses, color: VIOLATION_COLORS.sunglasses },
    { name: 'Drowsiness', value: driver.violations.drowsiness, color: VIOLATION_COLORS.drowsiness },
    { name: 'Smoking', value: driver.violations.smoking, color: VIOLATION_COLORS.smoking },
  ];

  return (
    <div className="p-6 space-y-5">
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
              style={{ background: `linear-gradient(135deg, ${driver.avatarColor}40, ${driver.avatarColor}20)`, color: driver.avatarColor, border: `2px solid ${driver.avatarColor}40` }}
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
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: `${routeColor}15`, color: routeColor }}
              >
                {ROUTE_LABELS[driver.routeType]} Route
              </span>
            </div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
              {driver.licenseNumber} • Age {driver.age} • {driver.experience} years experience
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Safety Score', value: `${driver.safetyScore}%`, color: scoreColor },
                { label: 'Global Rank', value: `#${driver.rank} / ${drivers.length}`, color: '#6366f1' },
                { label: 'Total Violations', value: driver.totalViolations, color: '#f97316' },
                { label: 'Member Since', value: new Date(driver.joinDate).getFullYear(), color: '#06b6d4' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ color: '#475569', fontSize: 11 }}>{item.label}</div>
                  <div style={{ color: item.color, fontWeight: 700, fontSize: 20 }}>{item.value}</div>
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
                  strokeDasharray={`${2 * Math.PI * 36 * driver.safetyScore / 100} ${2 * Math.PI * 36}`}
                  transform="rotate(-90 45 45)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Shield size={14} color={scoreColor} />
                <div style={{ color: scoreColor, fontWeight: 800, fontSize: 16 }}>{driver.safetyScore}</div>
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
                <Radar name="Score" dataKey="A" stroke={driver.avatarColor} fill={driver.avatarColor} fillOpacity={0.15} strokeWidth={2} />
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
                {ROUTE_LABELS[driver.routeType]}
              </span>
            </div>
            {route && (
              <>
                <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{route.name}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginBottom: 12 }}>{route.description}</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Distance', value: `${route.distance} km` },
                    { label: 'Daily Trips', value: route.dailyTrips },
                    { label: 'Stops', value: route.stops },
                    { label: 'Travel Time', value: `~${route.avgTravelTime} min` },
                  ].map(item => (
                    <div key={item.label} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ color: '#475569', fontSize: 11 }}>{item.label}</div>
                      <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </>
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
                { icon: Hash, label: 'License Number', value: driver.licenseNumber },
                { icon: Calendar, label: 'Join Date', value: new Date(driver.joinDate).toLocaleDateString() },
                { icon: Clock, label: 'Last Active', value: new Date(driver.lastActive).toLocaleString() },
                { icon: TrendingUp, label: 'Experience', value: `${driver.experience} years` },
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
                const Icon = violationIcons[v.type];
                const color = VIOLATION_COLORS[v.type];
                const statusColors: Record<string, string> = {
                  pending: '#f59e0b', reviewed: '#10b981', flagged: '#ef4444',
                };
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
                          <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }}>{VIOLATION_LABELS[v.type]}</div>
                          <span
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{ background: `${statusColors[v.status]}15`, color: statusColors[v.status] }}
                          >
                            {v.status}
                          </span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: 11 }}>{v.location}</div>
                        <div className="flex items-center justify-between mt-1">
                          <div style={{ color: '#475569', fontSize: 11 }}>
                            {new Date(v.timestamp).toLocaleString()}
                          </div>
                          <div style={{ color: color, fontSize: 11, fontWeight: 600 }}>{v.confidence}% conf.</div>
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
