import AdminNavbar from "@/components/admin/admin-navbar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
