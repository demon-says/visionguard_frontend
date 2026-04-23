import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Map,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  Eye,
  Phone,
  Glasses,
  Brain,
  Cigarette,
  CheckCircle,
  Flag,
  X,
} from 'lucide-react';
import { useDashboardSummaryPolled, useAiStatus, useRecentViolations } from '../api/hooks';
import { VIOLATION_COLORS, VIOLATION_LABELS } from '../data/constants';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/drivers', icon: Users, label: 'Drivers' },
  { to: '/violations', icon: AlertTriangle, label: 'Violations' },
  { to: '/routes', icon: Map, label: 'Routes' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const bottomNav = [
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const violationIcons: Record<string, any> = {
  phone: Phone,
  mobile: Phone,
  sunglasses: Glasses,
  drowsiness: Brain,
  drowsy: Brain,
  smoking: Cigarette,
};

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: '#f59e0b', icon: AlertTriangle, label: 'Pending' },
  reviewed: { color: '#10b981', icon: CheckCircle, label: 'Reviewed' },
  flagged: { color: '#ef4444', icon: Flag, label: 'Flagged' },
};

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const notifRef = useRef<HTMLDivElement>(null);

  // Live stats from the backend (polled every 30s)
  const { data: summaryRes } = useDashboardSummaryPolled();
  const { data: aiStatusRes } = useAiStatus();
  const { data: recentRes } = useRecentViolations(10);

  const summary = summaryRes?.data;
  const aiStatus = aiStatusRes?.data;
  const notifications = recentRes?.data || [];

  const activeDrivers = summary?.active_drivers ?? '–';
  const pendingAlerts = (summary?.pending_violations ?? 0) + (summary?.flagged_violations ?? 0);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  // Close notif panel on route change
  useEffect(() => { setNotifOpen(false); }, [location.pathname]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/drivers/')) return 'Driver Profile';
    if (path.startsWith('/drivers')) return 'Driver Management';
    if (path.startsWith('/violations')) return 'Violation Logs';
    if (path.startsWith('/routes')) return 'Route Management';
    if (path.startsWith('/reports')) return 'Analytics & Reports';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Vision Guard';
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080d1a', fontFamily: 'Inter, sans-serif' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 flex flex-col h-full transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          background: 'linear-gradient(180deg, #0d1528 0%, #0a1020 100%)',
          borderRight: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            }}
          >
            <Eye size={20} color="#fff" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Vision</div>
              <div style={{ color: '#6366f1', fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>Guard</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive ? 'nav-active' : 'nav-inactive'
                }`
              }
              style={({ isActive }) => ({
                background: isActive
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(6,182,212,0.15) 100%)'
                  : 'transparent',
                color: isActive ? '#a5b4fc' : '#64748b',
                border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              })}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
              )}
              {!collapsed && label === 'Violations' && pendingAlerts > 0 && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: '#ef4444', color: '#fff', fontSize: 11 }}
                >
                  {pendingAlerts}
                </span>
              )}
              {collapsed && (
                <div
                  className="absolute left-full ml-2 px-2 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                  style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', fontSize: 13 }}
                >
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-2 py-4" style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }}>
          {bottomNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
              style={({ isActive }) => ({
                background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: isActive ? '#a5b4fc' : '#64748b',
              })}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>}
            </NavLink>
          ))}

          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all mt-1 hover:opacity-80"
            style={{ color: '#475569' }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>Collapse</span>}
          </button>
        </div>

        {/* AI Status — live from backend */}
        {!collapsed && (
          <div
            className="mx-3 mb-4 p-3 rounded-xl"
            style={{
              background: aiStatus?.isRunning ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${aiStatus?.isRunning ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${aiStatus?.isRunning ? 'animate-pulse' : ''}`}
                style={{ background: aiStatus?.isRunning ? '#10b981' : '#ef4444' }}
              />
              <span
                style={{ color: aiStatus?.isRunning ? '#10b981' : '#ef4444', fontSize: 12, fontWeight: 600 }}
              >
                {aiStatus?.isRunning ? 'AI Engine Active' : 'AI Engine Stopped'}
              </span>
            </div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
              {aiStatus?.isRunning
                ? `${aiStatus.fetchCount} cycles • ${aiStatus.totalInserted} violations`
                : aiStatus?.lastError || 'Poller not running'}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-6 py-4 shrink-0"
          style={{
            background: 'rgba(8,13,26,0.95)',
            borderBottom: '1px solid rgba(99,102,241,0.15)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1">
            <h1 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700 }}>{getPageTitle()}</h1>
            <p style={{ color: '#475569', fontSize: 12 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Quick stats — live from backend */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
              <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>{activeDrivers} Active Drivers</span>
            </div>
            {pendingAlerts > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle size={13} color="#ef4444" />
                <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}>{pendingAlerts} Pending Alerts</span>
              </div>
            )}
          </div>

          {/* Notification bell + dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl transition-all hover:opacity-80"
              style={{
                background: notifOpen ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.1)',
                border: notifOpen ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <Bell size={18} color="#a5b4fc" />
              {pendingAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#ef4444', border: '2px solid #080d1a' }} />
              )}
            </button>

            {/* Notification dropdown panel */}
            {notifOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-96 max-h-[480px] rounded-2xl overflow-hidden z-50"
                style={{
                  background: '#111827',
                  border: '1px solid rgba(99,102,241,0.2)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2">
                    <Bell size={15} color="#a5b4fc" />
                    <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>Notifications</span>
                    {pendingAlerts > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                      >
                        {pendingAlerts}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <X size={14} color="#64748b" />
                  </button>
                </div>

                {/* Notification list */}
                <div className="overflow-y-auto max-h-[380px]">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <CheckCircle size={28} color="#10b981" className="mx-auto mb-2" />
                      <div style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>All clear!</div>
                      <div style={{ color: '#475569', fontSize: 12 }}>No recent violations detected.</div>
                    </div>
                  ) : (
                    notifications.map((n, i) => {
                      const Icon = violationIcons[n.violation_type] || AlertTriangle;
                      const color = VIOLATION_COLORS[n.violation_type] || '#6366f1';
                      const sc = statusConfig[n.status] || statusConfig.pending;
                      const isPending = n.status === 'pending' || n.status === 'flagged';
                      return (
                        <Link
                          key={n.id}
                          to="/violations"
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 transition-all hover:opacity-80"
                          style={{
                            borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            background: isPending ? 'rgba(245,158,11,0.03)' : 'transparent',
                          }}
                        >
                          {/* Icon */}
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                            <Icon size={16} color={color} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }}>
                                {VIOLATION_LABELS[n.violation_type] || n.violation_label}
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={{ background: `${sc.color}15`, color: sc.color, fontSize: 10, fontWeight: 600 }}
                              >
                                {sc.label}
                              </span>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                              <span style={{ fontWeight: 600 }}>{n.driver_name}</span>
                              {n.route_name && <span> • {n.route_name}</span>}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span style={{ color: '#475569', fontSize: 10 }}>
                                {n.detection_date ? formatTimeAgo(n.detection_date) : ''}
                              </span>
                              {n.confidence && (
                                <span style={{ color: color, fontSize: 10, fontWeight: 600 }}>{n.confidence}% conf.</span>
                              )}
                            </div>
                          </div>

                          {/* Unread dot */}
                          {isPending && (
                            <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: sc.color }} />
                          )}
                        </Link>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <Link
                    to="/violations"
                    onClick={() => setNotifOpen(false)}
                    className="flex items-center justify-center py-2.5 transition-all hover:opacity-80"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}
                  >
                    View all violations →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff' }}
            >
              AD
            </div>
            <div className="hidden sm:block">
              <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>Admin</div>
              <div style={{ color: '#475569', fontSize: 11 }}>Supervisor</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#080d1a' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}