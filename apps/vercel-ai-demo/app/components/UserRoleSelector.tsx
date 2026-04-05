"use client";

import { useState } from "react";
import { cn } from "@/app/lib/utils";

interface UserRoleSelectorProps {
  currentRole: "admin" | "manager" | "user";
  onRoleChange: (role: "admin" | "manager" | "user") => void;
}

export function UserRoleSelector({
  currentRole,
  onRoleChange,
}: UserRoleSelectorProps) {
  const roles = [
    {
      id: "admin",
      label: "Admin",
      description: "Full system access",
      color: "bg-red-100 text-red-800",
    },
    {
      id: "manager",
      label: "Manager",
      description: "Team management",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "user",
      label: "User",
      description: "Basic access",
      color: "bg-green-100 text-green-800",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select User Role</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The dashboard will adapt based on the selected role
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleChange(role.id as any)}
            className={cn(
              "flex flex-col items-start p-4 rounded-lg border transition-all text-left",
              currentRole === role.id
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50 hover:bg-gray-50",
            )}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="font-medium">{role.label}</span>
              <span
                className={cn("text-xs px-2 py-1 rounded-full", role.color)}
              >
                {role.id}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{role.description}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              {currentRole === role.id
                ? "✓ Currently active"
                : "Click to switch"}
            </div>
          </button>
        ))}
      </div>

      <div className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
        <div className="font-medium mb-1">How AI adapts the UI:</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Admin: System-wide metrics, user management, security controls
          </li>
          <li>
            Manager: Team performance, project tracking, approval workflows
          </li>
          <li>User: Personal tasks, limited view, self-service actions</li>
        </ul>
      </div>
    </div>
  );
}
