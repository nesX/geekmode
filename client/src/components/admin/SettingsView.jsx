import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/authStore';
import { Loader2, Check, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

const FIELDS = [
  { key: 'contact_whatsapp', label: 'WhatsApp', type: 'text', placeholder: '+57 300 123 4567', inputType: 'tel' },
  { key: 'contact_email', label: 'Email', type: 'text', placeholder: 'hola@geekmode.co', inputType: 'email' },
  { key: 'contact_instagram', label: 'Instagram', type: 'text', placeholder: '@geekmode', inputType: 'text' },
  { key: 'shipping_time', label: 'Tiempo de envío', type: 'text', placeholder: '3 a 5 días hábiles', inputType: 'text' },
  { key: 'free_shipping_message', label: 'Mensaje de envío gratis', type: 'textarea', placeholder: 'Envío gratis en compras superiores a $150.000' },
];

export default function SettingsView() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      const data = await res.json();
      const map = {};
      for (const s of data.settings) {
        map[s.key] = s.value;
      }
      setValues(map);
    } catch {
      // error silencioso
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFeedback((prev) => ({ ...prev, [key]: null }));
  };

  const handleSave = async (key) => {
    const value = values[key]?.trim();
    if (!value) return;

    if (key === 'contact_whatsapp' && !value.startsWith('+')) {
      setFeedback((prev) => ({ ...prev, [key]: { type: 'error', msg: 'Debe empezar con +' } }));
      return;
    }
    if (key === 'contact_email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFeedback((prev) => ({ ...prev, [key]: { type: 'error', msg: 'Email inválido' } }));
      return;
    }

    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await adminFetch(`${API_URL}/api/admin/settings/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setFeedback((prev) => ({ ...prev, [key]: { type: 'success', msg: 'Guardado' } }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [key]: null })), 3000);
    } catch (err) {
      setFeedback((prev) => ({ ...prev, [key]: { type: 'error', msg: err.message } }));
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="space-y-6">
        {FIELDS.map((field) => (
          <div key={field.key} className="bg-surface rounded-xl border border-white/10 p-5">
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              {field.label}
            </label>
            <div className="flex gap-3">
              {field.type === 'textarea' ? (
                <textarea
                  rows={2}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="flex-1 bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              ) : (
                <input
                  type={field.inputType}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="flex-1 bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                />
              )}
              <button
                onClick={() => handleSave(field.key)}
                disabled={saving[field.key]}
                className="px-4 py-2.5 bg-primary hover:opacity-90 text-white font-bold rounded-lg transition-all text-sm disabled:opacity-50 shrink-0"
              >
                {saving[field.key] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
            {feedback[field.key] && (
              <div className={`flex items-center gap-1.5 mt-2 text-sm ${
                feedback[field.key].type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {feedback[field.key].type === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {feedback[field.key].msg}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
