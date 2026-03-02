import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { SetupForm } from "@/components/setup/SetupForm";

export default async function SetupPage() {
  const session = await getSession();
  const t = await getTranslations("Setup");

  // If already logged in, redirect to rooms
  if (session) {
    redirect("/rooms");
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("description")}
          </p>
        </div>
        <SetupForm />
      </Card>
    </div>
  );
}
