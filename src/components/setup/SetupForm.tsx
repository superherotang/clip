"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SetupForm() {
  const router = useRouter();
  const t = useTranslations("Setup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/setup/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errors.failed"));
      }

      router.push("/rooms");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.failed"));
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
        label={t("username")}
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={t("usernamePlaceholder")}
        required
        minLength={3}
      />
      <Input
        label={t("password")}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("passwordPlaceholder")}
        required
        minLength={6}
      />
      <Input
        label={t("confirmPassword")}
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t("confirmPasswordPlaceholder")}
        required
        minLength={6}
      />
      <Button type="submit" isLoading={isLoading} className="w-full">
        {t("submit")}
      </Button>
    </form>
  );
}
