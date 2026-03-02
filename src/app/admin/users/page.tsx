import { redirect } from "next/navigation";
import { getSession, requireAdmin } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { UsersManagement } from "@/components/admin/UsersManagement";

export default async function AdminUsersPage() {
  const session = await getSession();
  const t = await getTranslations("Admin.users");

  if (!session) {
    redirect("/login");
  }

  // Verify admin access (will throw if not admin)
  try {
    await requireAdmin(session);
  } catch {
    redirect("/rooms");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("description")}
        </p>
      </div>

      <UsersManagement />
    </div>
  );
}
