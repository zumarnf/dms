import { requireProfile } from "@/processes/auth/guard";
import { AppSidebar } from "@/widgets/app-sidebar/AppSidebar";
import { AppTopbar } from "@/widgets/app-topbar/AppTopbar";

// Protected shell: every route in this group requires a session.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireProfile();

  return (
    <div className="flex min-h-dvh">
      <AppSidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar userName={user.name} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
