import {
  LayoutDashboard,
  FileText,
  Folder,
  Trash2,
  Activity,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/shared/config/permissions";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Roles allowed to see this item; omitted = everyone. */
  roles?: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Dokumen", icon: FileText },
  { href: "/folders", label: "Folder", icon: Folder },
  { href: "/trash", label: "Sampah", icon: Trash2 },
  { href: "/activity", label: "Aktivitas", icon: Activity, roles: ["admin", "manager"] },
  { href: "/admin/users", label: "Pengguna", icon: Users, roles: ["admin"] },
];

export function visibleNavItems(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
