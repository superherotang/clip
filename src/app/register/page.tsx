import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect("/rooms");
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Create Account
        </h1>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
