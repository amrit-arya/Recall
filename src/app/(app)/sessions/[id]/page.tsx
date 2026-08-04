import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { getSessionById, getMemories, getMemoriesForSession } from "@/lib/data";
import { SessionDetailHeader } from "@/components/sessions/session-detail-header";
import { SessionMemorySection } from "@/components/sessions/session-memory-section";

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

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { id } = await params;
  const session = await getSessionById(id);

  if (!session) {
    notFound();
  }

  // Query all memories and attached memories for this session via Data Access Layer
  const [allMemories, attachedMemories] = await Promise.all([
    getMemories(),
    getMemoriesForSession(session.id),
  ]);

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

        {/* Attached Memories Section */}
        <SessionMemorySection
          sessionId={session.id}
          allMemories={allMemories}
          attachedMemories={attachedMemories}
        />
      </div>
    </div>
  );
}
