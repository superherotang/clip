"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

interface ClipboardItem {
  id: string;
  type: "text" | "image" | "file";
  content: string;
  title?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
  };
  meta?: {
    originalName?: string;
    mimeType?: string;
    size?: number;
  };
}

export function ClipboardManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations();
  const { showSuccess, showError } = useToast();
  const roomId = searchParams.get("roomId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [textInput, setTextInput] = useState("");
  const [category, setCategory] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (roomId) {
      fetchItems();
    }
  }, [roomId]);

  const fetchItems = async () => {
    if (!roomId) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/clipboard?roomId=${roomId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch items");
      }

      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddText = async () => {
    if (!textInput.trim() || !roomId) return;

    try {
      const response = await fetch("/api/clipboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          type: "text",
          content: textInput,
          category: category || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add item");
      }

      setItems([data, ...items]);
      setTextInput("");
      setCategory("");
      showSuccess(t("Toast.createSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Toast.addError"));
      showError(t("Toast.addError"));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomId", roomId);
    formData.append("type", file.type.startsWith("image/") ? "image" : "file");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      setItems([data, ...items]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      showSuccess(t("Toast.uploadSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Toast.uploadError"));
      showError(t("Toast.uploadError"));
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!roomId) return;

    setIsDeleting(itemId);

    try {
      const response = await fetch(`/api/clipboard?id=${itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete item");
      }

      setItems(items.filter((item) => item.id !== itemId));
      showSuccess(t("Toast.deleteSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Toast.deleteError"));
      showError(t("Toast.deleteError"));
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = async (itemId: string) => {
    if (!roomId) return;

    try {
      const response = await fetch("/api/clipboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: itemId,
          content: editContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update item");
      }

      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, content: editContent } : item
        )
      );
      setIsEditing(null);
      setEditContent("");
      showSuccess(t("Toast.updateSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Toast.updateError"));
      showError(t("Toast.updateError"));
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(t("Toast.copySuccess"));
    } catch (err) {
      console.error("Failed to copy:", err);
      showError(t("Toast.copyError"));
    }
  };

  const startEdit = (item: ClipboardItem) => {
    setIsEditing(item.id);
    setEditContent(item.content);
  };

  const categories = Array.from(
    new Set(items.map((item) => item.category).filter(Boolean))
  ) as string[];

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/rooms")}>
            ← {t("Clipboard.back")}
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("Clipboard.title")}
          </h1>
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {t("Clipboard.all")}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "primary" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Add new item */}
      <Card className="space-y-4">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t("Clipboard.textPlaceholder")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white min-h-[100px]"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t("Clipboard.categoryPlaceholder")}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <Button onClick={handleAddText} disabled={!textInput.trim()}>
            {t("Clipboard.addText")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,*/*"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            {t("Clipboard.uploadFile")}
          </Button>
        </div>
      </Card>

      {/* Clipboard items */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t("Clipboard.noItems")}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="relative group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {item.type === "image" && (
                    <span className="text-lg">🖼️</span>
                  )}
                  {item.type === "file" && (
                    <span className="text-lg">📎</span>
                  )}
                  {item.type === "text" && (
                    <span className="text-lg">📝</span>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.title || t("Clipboard.untitled")}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.type === "text" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(item)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(item.content)}
                      >
                        📋
                      </Button>
                    </>
                  )}
                  {item.type === "file" && item.meta?.originalName && (
                    <a
                      href={item.content}
                      download={item.meta.originalName}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      ⬇️
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    isLoading={isDeleting === item.id}
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              {item.type === "image" ? (
                <img
                  src={item.content}
                  alt={item.title || "Uploaded image"}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
              ) : item.type === "text" ? (
                isEditing === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(item.id)}
                      >
                        {t("Clipboard.edit.save")}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsEditing(null)}
                      >
                        {t("Clipboard.edit.cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4 mb-2">
                    {item.content}
                  </p>
                )
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <p>{item.meta?.originalName}</p>
                  {item.meta?.size && (
                    <p className="text-xs">{formatFileSize(item.meta.size)}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {item.category && (
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full mr-2">
                      {item.category}
                    </span>
                  )}
                </span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
