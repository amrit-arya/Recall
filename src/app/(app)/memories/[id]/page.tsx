import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Folder, Tag, Paperclip, Sparkles } from "lucide-react";
import { getMemoryById, getSessions } from "@/lib/data";
import { MemoryTypeIcon, MemoryTypeBadge } from "@/components/shared/memory-type-icon";
import { formatRelativeTime, extractDomain } from "@/lib/utils";
import { SessionCard } from "@/components/sessions/session-card";
import { MemoryDetailActions } from "@/components/memories/memory-detail-actions";

interface MemoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MemoryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const memory = await getMemoryById(id);
  return {
    title: memory ? memory.title : "Memory Detail",
  };
}

export const dynamic = "force-dynamic";

export default async function MemoryDetailPage({ params }: MemoryDetailPageProps) {
  const { id } = await params;
  const memory = await getMemoryById(id);

  if (!memory) {
    notFound();
  }

  // Associated sessions via Data Access Layer
  const allSessions = await getSessions();
  const associatedSessions = allSessions.filter((s) =>
    memory.sessionIds?.includes(s.id)
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/memories"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Memories
          </Link>
        </div>

        {/* Memory Header Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <MemoryTypeIcon type={memory.type} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <MemoryTypeBadge type={memory.type} />
                  {memory.collection && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Folder className="h-3 w-3" />
                      {memory.collection}
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  {memory.title}
                </h1>
              </div>
            </div>

            {/* Edit / Delete / Visit Actions */}
            <MemoryDetailActions memory={memory} />
          </div>

          {/* Description */}
          {memory.description && (
            <p className="text-sm text-muted-foreground">{memory.description}</p>
          )}

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/60">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created {formatRelativeTime(memory.createdAt)}</span>
            </div>
            {memory.url && (
              <div className="flex items-center gap-1">
                <span>Domain:</span>
                <span className="font-mono text-foreground">{extractDomain(memory.url)}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Summary Banner (if present) */}
        {memory.aiSummary && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              <span>AI Summary</span>
            </div>
            <p className="text-sm text-foreground/90">{memory.aiSummary}</p>
          </div>
        )}

        {/* Content Section */}
        {memory.content && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Content</h2>
            {memory.type === "code" ? (
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs text-foreground leading-relaxed">
                <code>{memory.content}</code>
              </pre>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap">
                {memory.content}
              </div>
            )}
          </div>
        )}

        {/* Attachment preview if image/pdf */}
        {memory.attachmentUrl && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attachment</h2>
            {memory.type === "image" || memory.type === "screenshot" ? (
              <div className="overflow-hidden rounded-lg border border-border relative h-96 w-full">
                <Image
                  src={memory.attachmentUrl}
                  alt={memory.title}
                  fill
                  unoptimized
                  className="object-contain bg-black/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            ) : (
              <a
                href={memory.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs font-medium text-foreground hover:bg-muted"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span>View Attachment ({memory.type.toUpperCase()})</span>
              </a>
            )}
          </div>
        )}

        {/* Tags */}
        {memory.tags.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {memory.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Associated Sessions */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-medium text-foreground">Associated Work Sessions</h2>
          {associatedSessions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No work sessions attached to this memory yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {associatedSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
