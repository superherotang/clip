"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("Auth.errors.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("Auth.errors.passwordTooShort"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("Auth.errors.registrationFailed"));
      }

      setApiKey(data.apiKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Auth.errors.registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push("/rooms");
    router.refresh();
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    alert(t("Auth.register.apiKeyTitle"));
  };

  if (apiKey) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm">
          {t("Common.success")}
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
          <p className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
            {t("Auth.register.apiKeyTitle")}
          </p>
          <p className="text-yellow-700 dark:text-yellow-500 mb-2">
            {t("Auth.register.apiKeyDescription")}
          </p>
          <div className="flex gap-2 mt-2">
            <code className="flex-1 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs break-all">
              {apiKey}
            </code>
            <Button variant="secondary" size="sm" onClick={copyApiKey}>
              {t("Common.copy")}
            </Button>
          </div>
        </div>
        <Button onClick={handleContinue} className="w-full">
          {t("Auth.register.continue")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <Input
        label={t("Auth.register.email")}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("Auth.register.emailPlaceholder")}
        required
      />
      <Input
        label={t("Auth.register.username")}
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={t("Auth.register.usernamePlaceholder")}
        required
      />
      <Input
        label={t("Auth.register.password")}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("Auth.register.passwordPlaceholder")}
        required
      />
      <Input
        label={t("Auth.register.confirmPassword")}
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t("Auth.register.confirmPasswordPlaceholder")}
        required
      />
      <Button type="submit" isLoading={isLoading} className="w-full">
        {t("Auth.register.submit")}
      </Button>
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {t("Auth.register.hasAccount")}{" "}
        <Link
          href="/login"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("Auth.register.login")}
        </Link>
      </p>
    </form>
  );
}
