"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface User {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    ownedRooms: number;
    roomMembers: number;
  };
}

interface UserListProps {
  refreshTrigger: number;
}

export function UserList({ refreshTrigger }: UserListProps) {
  const t = useTranslations("Admin.users");
  const tCommon = useTranslations("Common");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }

    setDeletingUserId(userId);

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("errors.deleteFailed"));
      }

      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err instanceof Error ? err.message : t("errors.deleteFailed"));
    } finally {
      setDeletingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          {tCommon("loading")}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {t("userList")}
      </h2>
      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t("noUsers")}
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {user.username}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {t(`roles.${user.role}`)}
                  </span>
                  {!user.isActive && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      {t("inactive")}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t("rooms")}: {user._count.ownedRooms + user._count.roomMembers} |{" "}
                  {t("created")}: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(user.id)}
                disabled={deletingUserId === user.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {deletingUserId === user.id ? tCommon("loading") : tCommon("delete")}
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
