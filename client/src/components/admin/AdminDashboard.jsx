import { useStore } from '@nanostores/react';
import { authUser, logout } from '../../lib/authStore';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  Box,
  Eye
} from 'lucide-react';

export default function AdminDashboard() {
  const user = useStore(authUser);

  const handleLogout = () => {
    logout();
    // Also sign out from Google
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Package, label: 'Productos', active: false },
    { icon: ShoppingCart, label: 'Pedidos', active: false },
    { icon: Users, label: 'Clientes', active: false },
    { icon: Settings, label: 'Configuracion', active: false },
  ];

  const statsCards = [
    {
      icon: DollarSign,
      label: 'Ventas Hoy',
      value: '$0',
      change: '+0%',
      color: 'primary'
    },
    {
      icon: ShoppingCart,
      label: 'Pedidos',
      value: '0',
      change: '+0%',
      color: 'secondary'
    },
    {
      icon: Box,
      label: 'Productos',
      value: '12',
      change: '0',
      color: 'accent'
    },
    {
      icon: Eye,
      label: 'Visitas',
      value: '0',
      change: '+0%',
      color: 'primary'
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-white p-1.5 rounded shadow-[0_0_10px_rgba(139,92,246,0.5)] text-sm font-bold">
              GS
            </span>
            <span className="font-bold text-text-main">
              Admin<span className="text-primary">Panel</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    item.active
                      ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(139,92,246,0.2)]'
                      : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-primary/50"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-main truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-surface/50 border-b border-white/10 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-text-main">Dashboard</h1>
            <p className="text-sm text-text-muted">Bienvenido de vuelta, {user?.name?.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((card) => (
              <div
                key={card.label}
                className="bg-surface rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${card.color}/20`}>
                    <card.icon className={`w-6 h-6 text-${card.color}`} />
                  </div>
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    {card.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-text-main mb-1">{card.value}</p>
                <p className="text-sm text-text-muted">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-semibold text-text-main">Pedidos Recientes</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                  <ShoppingCart className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-sm">No hay pedidos recientes</p>
                  <p className="text-xs mt-1">Los nuevos pedidos apareceran aqui</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-semibold text-text-main">Acciones Rapidas</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-6 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors group">
                  <Package className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-text-main">Nuevo Producto</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 rounded-lg bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 transition-colors group">
                  <ShoppingCart className="w-8 h-8 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-text-main">Ver Pedidos</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 rounded-lg bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-colors group">
                  <Users className="w-8 h-8 text-accent mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-text-main">Clientes</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                  <Settings className="w-8 h-8 text-text-muted mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-text-main">Configurar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Products Overview */}
          <div className="mt-6 bg-surface rounded-xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-main">Productos Destacados</h2>
              <button className="text-sm text-primary hover:underline">Ver todos</button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                <Box className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm">Cargando productos...</p>
                <p className="text-xs mt-1">Conecta la API para ver los productos</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
