import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Paperclip,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { getSessionById, getMemories } from "@/lib/data";
import { formatRelativeTime } from "@/lib/utils";
import { MemoryCard } from "@/components/memories/memory-card";
import { SessionDetailHeader } from "@/components/sessions/session-detail-header";

interface SessionDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SessionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await getSessionById(id);
  return {
    title: session ? session.name : "Session Detail",
  };
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { id } = await params;
  const session = await getSessionById(id);

  if (!session) {
    notFound();
  }

  // Find memories attached to this session via Data Access Layer
  const allMemories = await getMemories();
  const attachedMemories = allMemories.filter((m) =>
    m.sessionIds?.includes(session.id)
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/sessions"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sessions
          </Link>
        </div>

        {/* Synchronized Header Block */}
        <SessionDetailHeader session={session} />

        {/* Current Context: Progress & Next Step */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Progress */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Current Progress</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {session.progress || "No progress notes logged yet."}
            </p>
          </div>

          {/* Next Step */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Next Step</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {session.nextStep || "No next step defined for this session."}
            </p>
          </div>
        </div>

        {/* Progress Notes Timeline / History */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Progress Log</h2>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Progress Note</span>
            </button>
          </div>

          {session.progressNotes && session.progressNotes.length > 0 ? (
            <div className="space-y-3 pl-2 border-l-2 border-border">
              {session.progressNotes.map((note) => (
                <div key={note.id} className="relative pl-4 space-y-0.5">
                  <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(note.createdAt)}
                  </p>
                  <p className="text-sm text-foreground">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No progress notes added yet.</p>
          )}
        </div>

        {/* Attached Memories Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                Attached Memories ({attachedMemories.length})
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Attach Memory</span>
            </button>
          </div>

          {attachedMemories.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
              No memories attached to this session yet. Attach relevant links, notes, or snippets to keep your work context connected.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attachedMemories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
