"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";

const locales = [
  { code: "zh", name: "中文" },
  { code: "en", name: "English" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const [currentLocale, setCurrentLocale] = useState(locale);

  const switchLanguage = async (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setCurrentLocale(newLocale);
    window.location.reload();
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentLocale}
        onChange={(e) => switchLanguage(e.target.value)}
        className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
      >
        {locales.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
