"use client";

import React, { useState } from "react";
import { UserForm } from "@/components/admin/UserForm";
import { UserList } from "@/components/admin/UserList";

export function UsersManagement() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <UserForm onSuccess={handleUserCreated} />
      </div>
      <div>
        <UserList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
