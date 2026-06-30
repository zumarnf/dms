import { requireProfile } from "@/processes/auth/guard";
import { db } from "@/shared/lib/db";
import { notificationRepository } from "@/entities/notification/repository";
import { AppSidebar } from "@/widgets/app-sidebar/AppSidebar";
import { AppTopbar } from "@/widgets/app-topbar/AppTopbar";

// Protected shell: every route in this group requires a session.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireProfile();
  const unreadCount = await notificationRepository(db).countUnread(user.id);

  return (
    <div className="flex min-h-dvh">
      <AppSidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar userName={user.name} unreadCount={unreadCount} role={user.role} />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
