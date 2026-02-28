"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("Auth.errors.loginFailed"));
      }

      router.push("/rooms");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Auth.errors.loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <Input
        label={t("Auth.login.email")}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("Auth.login.emailPlaceholder")}
        required
      />
      <Input
        label={t("Auth.login.password")}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("Auth.login.passwordPlaceholder")}
        required
      />
      <Button type="submit" isLoading={isLoading} className="w-full">
        {t("Auth.login.submit")}
      </Button>
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {t("Auth.login.noAccount")}{" "}
        <Link
          href="/register"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("Auth.login.register")}
        </Link>
      </p>
    </form>
  );
}
