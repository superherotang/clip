import { redirect } from "next/navigation";
import { getSession, requireAdmin } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const session = await getSession();
  const t = await getTranslations("Admin.settings");

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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("description")}
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
