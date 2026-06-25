// Admin / CEO dashboard layout — sidebar goes here
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar placeholder */}
      <aside className="w-56 shrink-0 bg-[#0D1B3E] text-white/60 text-xs p-4">
        <p className="font-semibold text-white mb-4">Forttune Admin</p>
        <nav className="space-y-2">
          <p>Dashboard</p>
          <p>Inventory</p>
          <p>Orders</p>
          <p>Reports</p>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
