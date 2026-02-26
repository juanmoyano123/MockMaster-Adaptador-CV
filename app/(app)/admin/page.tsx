'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_sign_in_at: string | null;
  subscription: { tier: string; status: string; admin_granted_access: boolean } | null;
  adaptations_this_month: number;
}

interface AdminResume {
  id: string;
  user_id: string;
  user_email: string;
  name: string;
  uploaded_at: string;
  preview: string;
}

interface AdminApplication {
  id: string;
  user_id: string;
  user_email: string;
  job_title: string;
  company_name: string;
  source: string;
  status: string;
  ats_score: number | null;
  applied_at: string;
}

type Tab = 'usuarios' | 'cvs' | 'aplicaciones' | 'configuracion';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function TierBadge({ tier, adminGranted }: { tier: string; adminGranted: boolean }) {
  if (adminGranted) {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Acceso Ext.</span>;
  }
  if (tier === 'pro') {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700 font-medium">Pro</span>;
  }
  return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Free</span>;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('usuarios');

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Resumes
  const [resumes, setResumes] = useState<AdminResume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [expandedResume, setExpandedResume] = useState<string | null>(null);

  // Applications
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [appSearch, setAppSearch] = useState('');
  const [appTotal, setAppTotal] = useState(0);

  // Pricing
  const [proPrice, setProPrice] = useState<number | null>(null);
  const [priceDraft, setPriceDraft] = useState('');
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceSaved, setPriceSaved] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/check')
      .then((r) => setAuthorized(r.ok))
      .catch(() => setAuthorized(false));
  }, []);

  // ── Fetch pricing ────────────────────────────────────────────────────────────
  const fetchPricing = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/pricing');
      if (r.ok) {
        const data = await r.json();
        setProPrice(data.price);
        setPriceDraft(String(data.price));
      }
    } catch {
      // non-critical
    }
  }, []);

  const handleSavePrice = async () => {
    const value = parseFloat(priceDraft);
    if (isNaN(value) || value <= 0) {
      setPriceError('Ingresá un número mayor a 0');
      return;
    }
    setPriceSaving(true);
    setPriceError(null);
    setPriceSaved(false);
    try {
      const r = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: value }),
      });
      if (r.ok) {
        const data = await r.json();
        setProPrice(data.price);
        setPriceDraft(String(data.price));
        setPriceSaved(true);
        setTimeout(() => setPriceSaved(false), 3000);
      } else {
        const err = await r.json();
        setPriceError(err.error || 'Error al guardar');
      }
    } finally {
      setPriceSaving(false);
    }
  };

  // ── Data fetchers ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const r = await fetch('/api/admin/users');
      const data = await r.json();
      setUsers(data.users || []);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchResumes = useCallback(async () => {
    setResumesLoading(true);
    try {
      const r = await fetch('/api/admin/resumes');
      const data = await r.json();
      setResumes(data.resumes || []);
    } finally {
      setResumesLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const r = await fetch('/api/admin/applications?limit=100');
      const data = await r.json();
      setApplications(data.applications || []);
      setAppTotal(data.total || 0);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) {
      fetchUsers();
      fetchResumes();
      fetchApplications();
      fetchPricing();
    }
  }, [authorized, fetchUsers, fetchResumes, fetchApplications, fetchPricing]);

  // ── Toggle admin access ──────────────────────────────────────────────────────
  const handleToggleAccess = async (userId: string, currentGranted: boolean) => {
    setTogglingId(userId);
    try {
      const r = await fetch('/api/admin/grant-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, granted: !currentGranted }),
      });
      if (r.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, subscription: { ...(u.subscription || { tier: 'free', status: 'active' }), admin_granted_access: !currentGranted } }
              : u
          )
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  // ── Loading / unauthorized states ────────────────────────────────────────────
  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.96L13.75 4a2 2 0 00-3.5 0L3.25 16.04A2 2 0 005.07 19z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso denegado</h2>
        <p className="text-slate-600 mb-6">No tenés permisos para acceder al panel de administración.</p>
        <Link href="/dashboard" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  // ── Filtered data ─────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredApps = applications.filter((a) =>
    !appSearch ||
    a.company_name?.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.job_title?.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.user_email?.toLowerCase().includes(appSearch.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Panel de Administración</h1>
            <p className="text-sm text-slate-500">{users.length} usuarios · {resumes.length} CVs · {appTotal} aplicaciones</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {([
            { id: 'usuarios', label: 'Usuarios', count: users.length },
            { id: 'cvs', label: 'CVs', count: resumes.length },
            { id: 'aplicaciones', label: 'Aplicaciones', count: appTotal },
            { id: 'configuracion', label: 'Configuración', count: null },
          ] as { id: Tab; label: string; count: number | null }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: Usuarios ─────────────────────────────────────────────────── */}
        {activeTab === 'usuarios' && (
          <div>
            <div className="p-4 border-b border-slate-100">
              <input
                type="text"
                placeholder="Buscar por email o nombre..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full max-w-sm px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Usuario</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Registrado</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Ultimo login</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Plan</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Adaptaciones</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Acceso Extension</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersLoading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                    : filteredUsers.length === 0
                    ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                          {userSearch ? 'Sin resultados' : 'No hay usuarios registrados'}
                        </td>
                      </tr>
                    )
                    : filteredUsers.map((u) => {
                      const granted = u.subscription?.admin_granted_access === true;
                      const isToggling = togglingId === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{u.email}</div>
                            <div className="text-xs text-slate-500">{u.name}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{formatDate(u.created_at)}</td>
                          <td className="px-4 py-3 text-slate-600">{formatDate(u.last_sign_in_at)}</td>
                          <td className="px-4 py-3">
                            <TierBadge tier={u.subscription?.tier || 'free'} adminGranted={granted} />
                          </td>
                          <td className="px-4 py-3 text-slate-600">{u.adaptations_this_month}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleAccess(u.id, granted)}
                              disabled={isToggling}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-50 ${
                                granted ? 'bg-purple-600' : 'bg-slate-200'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${granted ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: CVs ──────────────────────────────────────────────────────── */}
        {activeTab === 'cvs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Nombre CV</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Fecha carga</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resumesLoading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
                  : resumes.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-400">No hay CVs subidos</td>
                    </tr>
                  )
                  : resumes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600 text-xs">{r.user_email}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(r.uploaded_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedResume(expandedResume === r.id ? null : r.id)}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          {expandedResume === r.id ? 'Ocultar' : 'Ver preview'}
                        </button>
                        {expandedResume === r.id && (
                          <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded max-w-xs whitespace-pre-wrap">{r.preview}…</p>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Tab: Configuración ────────────────────────────────────────────── */}
        {activeTab === 'configuracion' && (
          <div className="p-6 max-w-lg space-y-6">
            {/* Precio Pro */}
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Precio del Plan Pro</h3>
              <p className="text-sm text-slate-500 mb-4">
                Modificá el precio que se muestra a los usuarios y se usa al crear nuevas suscripciones via API.
                {process.env.NODE_ENV !== 'production' && (
                  <span className="block mt-1 text-amber-600">
                    Nota: si usás MP_PLAN_ID, el cobro real lo define el plan en MercadoPago.
                  </span>
                )}
              </p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={priceDraft}
                    onChange={(e) => { setPriceDraft(e.target.value); setPriceError(null); setPriceSaved(false); }}
                    className="pl-7 pr-4 py-2.5 w-36 border border-slate-200 rounded-lg text-slate-900 font-semibold text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="100"
                  />
                </div>
                <span className="text-slate-500 text-sm font-medium">ARS / mes</span>
                <button
                  onClick={handleSavePrice}
                  disabled={priceSaving || priceDraft === String(proPrice)}
                  className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {priceSaving ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : priceSaved ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                  {priceSaving ? 'Guardando...' : priceSaved ? 'Guardado' : 'Guardar'}
                </button>
              </div>
              {priceError && (
                <p className="mt-2 text-sm text-red-600">{priceError}</p>
              )}
              {priceSaved && (
                <p className="mt-2 text-sm text-green-600">Precio actualizado correctamente.</p>
              )}
            </div>

            {/* Info card */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-amber-800 space-y-1">
                  <p className="font-medium">Importante sobre MercadoPago</p>
                  <p>Si tu cuenta usa un <strong>plan pre-creado</strong> en MercadoPago (MP_PLAN_ID), el cobro real lo determina el precio configurado en tu cuenta de MercadoPago, no este valor. Este campo controla el precio mostrado en la app y el cobrado al crear suscripciones por API.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Aplicaciones ─────────────────────────────────────────────── */}
        {activeTab === 'aplicaciones' && (
          <div>
            <div className="p-4 border-b border-slate-100">
              <input
                type="text"
                placeholder="Buscar por empresa, puesto o usuario..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="w-full max-w-sm px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Usuario</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Puesto</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Empresa</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Fuente</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">ATS</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicationsLoading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                    : filteredApps.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                          {appSearch ? 'Sin resultados' : 'No hay aplicaciones'}
                        </td>
                      </tr>
                    )
                    : filteredApps.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs text-slate-500">{a.user_email}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{a.job_title}</td>
                        <td className="px-4 py-3 text-slate-600">{a.company_name}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{a.source}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">{a.status}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{a.ats_score ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(a.applied_at)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
