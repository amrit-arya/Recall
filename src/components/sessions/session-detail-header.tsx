"use client";

import { useState } from "react";
import type { Session } from "@/types";
import { StatusBadge } from "@/components/shared/session-status-badge";
import { SessionStatusControls } from "@/components/sessions/session-status-controls";
import { SessionModal } from "@/components/sessions/session-modal";
import { DeleteSessionDialog } from "@/components/sessions/delete-session-dialog";
import { formatRelativeTime } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";

interface SessionDetailHeaderProps {
  session: Session;
}

export function SessionDetailHeader({ session }: SessionDetailHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <StatusBadge status={session.status} />
              {session.startTime && (
                <span className="text-xs text-muted-foreground">
                  Started {formatRelativeTime(session.startTime)}
                </span>
              )}
              {session.endTime && (
                <span className="text-xs text-muted-foreground">
                  • Finished {formatRelativeTime(session.endTime)}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              {session.name}
            </h1>
            {session.description && (
              <p className="text-sm text-muted-foreground">{session.description}</p>
            )}
          </div>

          {/* Action buttons + Status Controls */}
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>

            <SessionStatusControls sessionId={session.id} status={session.status} />
          </div>
        </div>
      </div>

      <SessionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialSession={session}
      />

      <DeleteSessionDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        sessionId={session.id}
        sessionName={session.name}
        redirectToSessions={true}
      />
    </>
  );
}
