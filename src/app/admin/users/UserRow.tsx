"use client";

import { cn } from "@/lib/utils";
import { Roles } from "@/config/roles";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface Props {
  user: AdminUser;
  selfId: string;
  onPatch: (id: string, patch: { isActive?: boolean; role?: string }) => Promise<void>;
  busy: string; // id currently being mutated
}

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function UserRow({ user, selfId, onPatch, busy }: Props) {
  const isSelf = user._id === selfId;
  const isBusy = busy === user._id;
  const isFaculty = user.role === Roles.FACULTY_ADMIN;

  return (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3">
        <p className="text-white/90 text-sm font-medium">{user.name}</p>
        {isSelf && <span className="text-[10px] text-violet-400/70">you</span>}
      </td>
      <td className="px-4 py-3 text-white/50 text-sm">{user.email}</td>
      <td className="px-4 py-3">
        <span className={cn(
          "px-2 py-0.5 rounded-md text-xs border",
          isFaculty
            ? "bg-violet-500/10 text-violet-300 border-violet-500/20"
            : "bg-sky-500/10 text-sky-300 border-sky-500/20"
        )}>
          {isFaculty ? "Faculty" : "Developer"}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-xs">
          <span className={cn("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-emerald-400" : "bg-red-400")} />
          <span className={user.isActive ? "text-emerald-300" : "text-red-300"}>
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </span>
      </td>
      <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">{fmt(user.lastLoginAt)}</td>
      <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">{fmt(user.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            disabled={isSelf || isBusy}
            onClick={() => onPatch(user._id, { role: isFaculty ? Roles.DEVELOPER_ADMIN : Roles.FACULTY_ADMIN })}
            title={isSelf ? "Cannot change own role" : "Toggle role"}
            className={cn(
              "px-2 py-1 rounded-md text-xs font-medium transition-all border",
              isFaculty
                ? "border-sky-500/20 text-sky-300 hover:bg-sky-500/10"
                : "border-violet-500/20 text-violet-300 hover:bg-violet-500/10",
              (isSelf || isBusy) && "opacity-30 cursor-not-allowed"
            )}
          >
            {isFaculty ? "→ Dev" : "→ Faculty"}
          </button>
          <button
            disabled={isSelf || isBusy}
            onClick={() => onPatch(user._id, { isActive: !user.isActive })}
            title={isSelf ? "Cannot deactivate yourself" : user.isActive ? "Deactivate" : "Activate"}
            className={cn(
              "px-2 py-1 rounded-md text-xs font-medium border transition-all",
              user.isActive
                ? "border-red-500/20 text-red-300 hover:bg-red-500/10"
                : "border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10",
              (isSelf || isBusy) && "opacity-30 cursor-not-allowed"
            )}
          >
            {user.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  );
}
