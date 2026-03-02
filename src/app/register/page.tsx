import { redirect } from "next/navigation";
import { getSession, getSystemSettings } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export default async function RegisterPage() {
  const session = await getSession();
  const t = await getTranslations();
  const tAuth = await getTranslations("Auth");
  const tRegister = await getTranslations("Register");

  if (session) {
    redirect("/rooms");
  }

  const settings = await getSystemSettings();

  if (!settings.allowRegistration) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {tRegister("disabled.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {tRegister("disabled.description")}
            </p>
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {tRegister("disabled.goToLogin")}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {tAuth("register.title")}
        </h1>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {tAuth("register.hasAccount")}{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {tAuth("register.login")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
