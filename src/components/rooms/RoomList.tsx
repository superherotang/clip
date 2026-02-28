"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

interface Room {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  role: string;
  memberCount: number;
  clipboardCount: number;
  createdAt: string | Date;
}

interface RoomListProps {
  initialRooms: Room[];
}

export function RoomList({ initialRooms }: RoomListProps) {
  const router = useRouter();
  const t = useTranslations();
  const { showSuccess } = useToast();
  const [rooms, setRooms] = useState(initialRooms);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName,
          description: newRoomDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      setRooms([data, ...rooms]);
      setIsCreateModalOpen(false);
      setNewRoomName("");
      setNewRoomDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("Rooms.joinError"));
      }

      setIsJoinModalOpen(false);
      setJoinCode("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Rooms.joinError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/rooms/${roomToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("Rooms.deleteError"));
      }

      setRooms(rooms.filter((room) => room.id !== roomToDelete));
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Rooms.deleteError"));
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (roomId: string) => {
    setRoomToDelete(roomId);
    setIsDeleteModalOpen(true);
  };

  const handleRoomClick = (roomId: string) => {
    router.push(`/clipboard?roomId=${roomId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("Rooms.title")}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsJoinModalOpen(true)}
          >
            {t("Rooms.joinRoom")}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            {t("Rooms.createRoom")}
          </Button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t("Rooms.noRooms")}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="secondary" onClick={() => setIsJoinModalOpen(true)}>
              {t("Rooms.joinARoom")}
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              {t("Rooms.createARoom")}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card
              key={room.id}
              onClick={() => handleRoomClick(room.id)}
              className="hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors relative group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {room.name}
                </h3>
                <div className="flex items-center gap-1">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      room.role === "owner"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {room.role === "owner" ? t("Rooms.owner") : t("Rooms.member")}
                  </span>
                  {room.role === "owner" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(room.id);
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title={t("Rooms.delete")}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {room.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {room.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span>Code: {room.code}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(room.code);
                      showSuccess(t("Toast.copySuccess"));
                    }}
                    className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title={t("Common.copy")}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <span>{room.memberCount} {t("Rooms.members")}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {room.clipboardCount} {t("Rooms.items")}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t("Rooms.create.title")}
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <Input
            label={t("Rooms.create.nameLabel")}
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder={t("Rooms.create.namePlaceholder")}
            required
          />
          <Input
            label={t("Rooms.create.descriptionLabel")}
            value={newRoomDescription}
            onChange={(e) => setNewRoomDescription(e.target.value)}
            placeholder={t("Rooms.create.descriptionPlaceholder")}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1"
            >
              {t("Rooms.create.cancel")}
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              {t("Rooms.create.submit")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Room Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title={t("Rooms.join.title")}
      >
        <form onSubmit={handleJoinRoom} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <Input
            label={t("Rooms.join.codeLabel")}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder={t("Rooms.join.codePlaceholder")}
            maxLength={6}
            required
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsJoinModalOpen(false)}
              className="flex-1"
            >
              {t("Rooms.join.cancel")}
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              {t("Rooms.join.submit")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Room Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("Rooms.deleteConfirmTitle")}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t("Rooms.deleteConfirmMessage")}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {t("Rooms.deleteWarning")}
          </p>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              {t("Rooms.delete_confirm.cancel")}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteRoom}
              isLoading={isLoading}
              className="flex-1"
            >
              {t("Rooms.delete_confirm.submit")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
