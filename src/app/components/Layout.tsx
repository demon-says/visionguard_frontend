import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
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
} from 'lucide-react';

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

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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
              {!collapsed && label === 'Violations' && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: '#ef4444', color: '#fff', fontSize: 11 }}
                >
                  3
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

        {/* AI Status */}
        {!collapsed && (
          <div className="mx-3 mb-4 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
              <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>AI Engine Active</span>
            </div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>6 feeds • Real-time detection</div>
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

          {/* Quick stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
              <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>8 Active Drivers</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={13} color="#ef4444" />
              <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}>3 Pending Alerts</span>
            </div>
          </div>

          {/* Notification bell */}
          <button className="relative p-2 rounded-xl transition-all hover:opacity-80" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Bell size={18} color="#a5b4fc" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
          </button>

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