import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "Memories",
};

export default function MemoriesPage() {
  return (
    <PageContainer
      title="Memories"
      description="Everything you've saved"
    >
      <EmptyState
        icon={Brain}
        title="No memories yet"
        description="Start capturing URLs, notes, code snippets, and more. They'll appear here."
      />
    </PageContainer>
  );
}
