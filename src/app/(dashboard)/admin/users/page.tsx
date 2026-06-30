import type { Metadata } from "next";
import { db } from "@/shared/lib/db";
import { requireCan } from "@/processes/auth/guard";
import { userRepository } from "@/entities/user/repository";
import { Badge } from "@/shared/ui/atoms";
import { ROLES } from "@/shared/config/permissions";
import { setUserRoleAction, setUserStatusAction } from "@/features/user-admin/api/action";

export const metadata: Metadata = { title: "Pengguna" };

export default async function AdminUsersPage() {
  // Requires user:manage (admin) — enforced server-side; non-admins get 403/redirect.
  const actor = await requireCan("user:manage");
  const users = await userRepository(db).list({ page: 1, pageSize: 100 });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Pengguna</h1>
      <p className="text-muted-foreground mt-1 text-sm">Kelola peran dan status akun.</p>

      <div className="border-border mt-5 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-136 text-sm">
          <thead className="bg-secondary/50 text-muted-foreground text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Nama</th>
              <th className="px-4 py-2.5 font-medium">Peran</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === actor.id;
              return (
                <tr key={u.id} className="border-border border-t align-middle">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {u.name} {isSelf && <span className="text-muted-foreground">(Anda)</span>}
                    </div>
                    <div className="text-muted-foreground text-xs">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <Badge variant="outline">{u.role}</Badge>
                    ) : (
                      <form action={setUserRoleAction} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <select name="role" defaultValue={u.role} className="input h-8 w-auto py-1">
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="text-primary text-xs underline-offset-4 hover:underline"
                        >
                          Simpan
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <Badge variant={u.status === "active" ? "success" : "destructive"}>
                        {u.status}
                      </Badge>
                    ) : (
                      <form action={setUserStatusAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={u.status === "active" ? "disabled" : "active"}
                        />
                        <button
                          type="submit"
                          className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
                        >
                          {u.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
