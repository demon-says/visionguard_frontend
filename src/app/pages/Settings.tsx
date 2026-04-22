import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Shield, Brain, Camera,
  Sliders, Save, RefreshCw, ChevronRight, ToggleLeft, ToggleRight, Info
} from 'lucide-react';

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button onClick={onToggle} className="relative w-11 h-6 rounded-full transition-all" style={{ background: enabled ? '#6366f1' : 'rgba(255,255,255,0.1)' }}>
    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: enabled ? '22px' : '2px' }} />
  </button>
);

export default function Settings() {
  const [detections, setDetections] = useState({
    phone: true,
    sunglasses: true,
    drowsiness: true,
    smoking: true,
  });
  const [thresholds, setThresholds] = useState({
    phone: 75,
    sunglasses: 70,
    drowsiness: 80,
    smoking: 75,
  });
  const [notifications, setNotifications] = useState({
    alertSound: true,
    emailAlerts: false,
    smsAlerts: false,
    autoFlag: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 20 }}>System Settings</div>
          <div style={{ color: '#475569', fontSize: 13 }}>Configure Vision Guard AI detection parameters</div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: saved ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)', color: saved ? '#10b981' : '#a5b4fc', border: `1px solid ${saved ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}` }}
        >
          {saved ? <><RefreshCw size={14} /> Saved!</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>

      {/* AI Detection Settings */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} color="#6366f1" />
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>AI Detection Modules</div>
        </div>
        <div className="space-y-4">
          {[
            { key: 'phone', label: 'Mobile Phone Detection', desc: 'Detects driver using phone while driving', color: '#f97316' },
            { key: 'sunglasses', label: 'Sunglasses Detection', desc: 'Detects driver wearing unauthorized sunglasses', color: '#eab308' },
            { key: 'drowsiness', label: 'Drowsiness Detection', desc: 'Analyzes eye closure and head position for drowsiness', color: '#ef4444' },
            { key: 'smoking', label: 'Smoking Detection', desc: 'Detects smoking behavior during driving', color: '#a855f7' },
          ].map(item => (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <div>
                    <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ color: '#475569', fontSize: 12 }}>{item.desc}</div>
                  </div>
                </div>
                <Toggle
                  enabled={detections[item.key as keyof typeof detections]}
                  onToggle={() => setDetections(d => ({ ...d, [item.key]: !d[item.key as keyof typeof d] }))}
                />
              </div>
              <div className="flex items-center gap-3 ml-6 mt-2">
                <span style={{ color: '#64748b', fontSize: 12, minWidth: 100 }}>Confidence Threshold: {thresholds[item.key as keyof typeof thresholds]}%</span>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={thresholds[item.key as keyof typeof thresholds]}
                  onChange={e => setThresholds(t => ({ ...t, [item.key]: Number(e.target.value) }))}
                  className="flex-1 accent-indigo-500"
                  style={{ maxWidth: 200 }}
                  disabled={!detections[item.key as keyof typeof detections]}
                />
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', width: 100 }}>
                  <div className="h-full rounded-full" style={{ width: `${thresholds[item.key as keyof typeof thresholds]}%`, background: item.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Assignment Settings */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sliders size={18} color="#06b6d4" />
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Route Assignment Thresholds</div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Demanding Route', desc: 'Min score required', value: 80, color: '#10b981' },
            { label: 'Moderate Route', desc: 'Min score required', value: 50, color: '#3b82f6' },
            { label: 'Simple Route', desc: 'Assigned below', value: 50, color: '#6b7280' },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{item.label}</div>
              </div>
              <div style={{ color: '#475569', fontSize: 12 }}>{item.desc}</div>
              <div style={{ color: item.color, fontSize: 26, fontWeight: 700, marginTop: 8 }}>{item.value}%</div>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Info size={14} color="#6366f1" className="mt-0.5 shrink-0" />
          <div style={{ color: '#64748b', fontSize: 12 }}>Route assignments are automatically updated weekly based on driver safety scores. Drivers can be manually reassigned by administrators.</div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} color="#f59e0b" />
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Notification Settings</div>
        </div>
        <div className="space-y-4">
          {[
            { key: 'alertSound', label: 'Alert Sound', desc: 'Play sound on new violation detection' },
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Send email for flagged violations' },
            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Send SMS for critical events' },
            { key: 'autoFlag', label: 'Auto-Flag High Severity', desc: 'Automatically flag violations with >90% confidence' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                <div style={{ color: '#475569', fontSize: 12 }}>{item.desc}</div>
              </div>
              <Toggle
                enabled={notifications[item.key as keyof typeof notifications]}
                onToggle={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Camera Settings */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Camera size={18} color="#ec4899" />
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Camera & Recording</div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: 'Camera Resolution', value: '1080p HD', editable: false },
            { label: 'Frame Rate', value: '30 FPS', editable: false },
            { label: 'Recording Retention', value: '30 days', editable: true },
            { label: 'Capture on Violation', value: 'Enabled', editable: false },
            { label: 'Night Vision Mode', value: 'Auto', editable: false },
            { label: 'Active Cameras', value: '6 / 6', editable: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#64748b', fontSize: 13 }}>{item.label}</div>
              <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0d1528 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} color="#10b981" />
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>System Information</div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { label: 'Vision Guard Version', value: 'v2.4.1' },
            { label: 'AI Model Version', value: 'v3.2.1' },
            { label: 'Last Model Update', value: 'Apr 10, 2026' },
            { label: 'Database Status', value: 'Connected', color: '#10b981' },
            { label: 'API Status', value: 'Operational', color: '#10b981' },
            { label: 'License Valid Until', value: 'Dec 31, 2026' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#475569', fontSize: 11 }}>{item.label}</div>
              <div style={{ color: (item as any).color || '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
