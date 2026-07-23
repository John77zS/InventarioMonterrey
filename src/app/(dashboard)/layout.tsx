import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh min-h-0 bg-muted/30">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-2 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}