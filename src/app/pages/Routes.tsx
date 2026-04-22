import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  Map, MapPin, Users, Clock, Navigation, ChevronRight,
  Zap, Minus, ArrowRight, TrendingUp, Shield
} from 'lucide-react';
import {
  routes, drivers, ROUTE_COLORS, ROUTE_LABELS, RouteType
} from '../data/mockData';

const difficultyConfig = {
  demanding: {
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.2)',
    icon: Zap,
    description: 'High-complexity routes for top-performing drivers only',
  },
  moderate: {
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.2)',
    icon: TrendingUp,
    description: 'Standard routes for drivers with good safety records',
  },
  simple: {
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.1)',
    border: 'rgba(107,114,128,0.2)',
    icon: Minus,
    description: 'Low-complexity routes for drivers under improvement',
  },
};

const RouteCard = ({ route }: { route: typeof routes[0] }) => {
  const [expanded, setExpanded] = useState(false);
  const config = difficultyConfig[route.difficulty];
  const DiffIcon = config.icon;
  const driver = drivers.find(d => d.id === route.assignedDriverId);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)',
        border: `1px solid ${config.border}`,
      }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: config.bg }}
            >
              <DiffIcon size={18} color={config.color} />
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>{route.name}</div>
              <div style={{ color: '#64748b', fontSize: 12 }}>Route ID: {route.id.toUpperCase()}</div>
            </div>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold shrink-0"
            style={{ background: config.bg, color: config.color }}
          >
            {ROUTE_LABELS[route.difficulty]}
          </span>
        </div>

        {/* From → To */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: config.color }} />
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{route.from}</span>
          </div>
          <ArrowRight size={14} color="#475569" />
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <MapPin size={11} color={config.color} />
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{route.to}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Distance', value: `${route.distance}km` },
            { label: 'Stops', value: route.stops },
            { label: 'Daily Trips', value: route.dailyTrips },
            { label: 'Travel', value: `~${route.avgTravelTime}m` },
          ].map(item => (
            <div key={item.label} className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{item.value}</div>
              <div style={{ color: '#475569', fontSize: 10 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Assigned driver */}
        {driver ? (
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: `${driver.avatarColor}10`, border: `1px solid ${driver.avatarColor}20` }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: `${driver.avatarColor}25`, color: driver.avatarColor }}
            >
              {driver.initials}
            </div>
            <div className="flex-1">
              <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{driver.name}</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>Score: {driver.safetyScore}% • #{driver.rank} ranked</div>
            </div>
            <Link
              to={`/drivers/${driver.id}`}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}
            >
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Users size={14} color="#475569" />
            <span style={{ color: '#475569', fontSize: 12 }}>No driver assigned</span>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 mt-3 text-xs transition-all hover:opacity-80"
          style={{ color: '#475569' }}
        >
          {expanded ? 'Hide details' : 'Show details'}
          <ChevronRight size={11} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 pt-0 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ paddingTop: 12 }}>
            <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Route Description</div>
            <div style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6 }}>{route.description}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#475569', fontSize: 11 }}>Passenger Capacity</div>
              <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{route.passengerCapacity} seats</div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#475569', fontSize: 11 }}>Avg Travel Time</div>
              <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{route.avgTravelTime} minutes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Routes() {
  const [filter, setFilter] = useState<string>('all');

  const demanding = routes.filter(r => r.difficulty === 'demanding');
  const moderate = routes.filter(r => r.difficulty === 'moderate');
  const simple = routes.filter(r => r.difficulty === 'simple');

  const filtered = filter === 'all' ? routes : routes.filter(r => r.difficulty === filter);

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Routes', value: routes.length, color: '#6366f1', icon: Map },
          { label: 'Demanding Routes', value: demanding.length, color: '#10b981', icon: Zap },
          { label: 'Moderate Routes', value: moderate.length, color: '#3b82f6', icon: TrendingUp },
          { label: 'Simple Routes', value: simple.length, color: '#6b7280', icon: Minus },
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

      {/* Route decision logic info */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(6,182,212,0.05) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.2)' }}>
            <Shield size={18} color="#6366f1" />
          </div>
          <div>
            <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>AI Route Decision Mechanism</div>
            <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
              Vision Guard automatically assigns routes based on each driver's safety score and violation history.
              Drivers with <span style={{ color: '#10b981', fontWeight: 600 }}>fewer violations (score ≥ 80%)</span> are assigned more <strong style={{ color: '#10b981' }}>demanding routes</strong>,
              while drivers with <span style={{ color: '#ef4444', fontWeight: 600 }}>higher violations</span> are restricted to <strong style={{ color: '#6b7280' }}>simpler routes</strong> until their record improves.
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {(Object.entries(difficultyConfig) as [RouteType, any][]).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <cfg.icon size={13} color={cfg.color} />
                  <span style={{ color: cfg.color, fontSize: 12, fontWeight: 600 }}>{ROUTE_LABELS[key]}</span>
                  <span style={{ color: '#64748b', fontSize: 12 }}>—</span>
                  <span style={{ color: '#64748b', fontSize: 12 }}>
                    {key === 'demanding' ? 'Score ≥ 80%' : key === 'moderate' ? 'Score 50–79%' : 'Score < 50%'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'demanding', 'moderate', 'simple'].map(f => {
          const cfg = f !== 'all' ? difficultyConfig[f as RouteType] : null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filter === f ? (cfg ? cfg.bg : 'rgba(99,102,241,0.2)') : 'rgba(255,255,255,0.04)',
                color: filter === f ? (cfg?.color || '#a5b4fc') : '#64748b',
                border: filter === f ? `1px solid ${cfg?.border || 'rgba(99,102,241,0.3)'}` : '1px solid transparent',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {f === 'all' ? routes.length : routes.filter(r => r.difficulty === f).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Route cards grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(route => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
}
