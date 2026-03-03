"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface SettingsData {
  allowRegistration: boolean;
  siteName: string;
  siteDescription: string | null;
  maxRoomsPerUser: number;
  maxClipboardItems: number;
}

export function SettingsForm() {
  const t = useTranslations("Admin.settings");
  const tCommon = useTranslations("Common");
  const [settings, setSettings] = useState<SettingsData>({
    allowRegistration: true,
    siteName: "Clipboard",
    siteDescription: "",
    maxRoomsPerUser: 10,
    maxClipboardItems: 100,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get" }),
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          ...settings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errors.failed"));
      }

      setSuccess(t("success"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">{tCommon("loading")}</div>;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("siteName")}
          </label>
          <Input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            placeholder={t("siteNamePlaceholder")}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("siteDescription")}
          </label>
          <textarea
            value={settings.siteDescription || ""}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value || null })}
            placeholder={t("siteDescriptionPlaceholder")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("maxRoomsPerUser")}
          </label>
          <Input
            type="number"
            value={settings.maxRoomsPerUser}
            onChange={(e) => setSettings({ ...settings, maxRoomsPerUser: parseInt(e.target.value) || 1 })}
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("maxClipboardItems")}
          </label>
          <Input
            type="number"
            value={settings.maxClipboardItems}
            onChange={(e) => setSettings({ ...settings, maxClipboardItems: parseInt(e.target.value) || 1 })}
            min="1"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("allowRegistration")}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("allowRegistrationDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.allowRegistration ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.allowRegistration ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" isLoading={isLoading} className="w-full">
            {t("save")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
