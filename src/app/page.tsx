import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();
  const t = await getTranslations("Home");

  if (session) {
    redirect("/rooms");
  }

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg">{t("getStarted")}</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              {t("getStarted")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {t("features.encrypted.title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t("features.encrypted.description")}
          </p>
        </Card>
        <Card className="text-center p-6">
          <div className="text-4xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {t("features.sync.title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t("features.sync.description")}
          </p>
        </Card>
        <Card className="text-center p-6">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {t("features.formats.title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t("features.formats.description")}
          </p>
        </Card>
        <Card className="text-center p-6">
          <div className="text-4xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {t("features.rooms.title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t("features.rooms.description")}
          </p>
        </Card>
        <Card className="text-center p-6">
          <div className="text-4xl mb-4">🔑</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {t("features.api.title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t("features.api.description")}
          </p>
        </Card>
        <Card className="text-center p-6">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {t("features.mobile.title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t("features.mobile.description")}
          </p>
        </Card>
      </section>
    </div>
  );
}
