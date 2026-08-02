import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { History } from "lucide-react";

export const metadata: Metadata = {
  title: "Timeline",
};

export default function TimelinePage() {
  return (
    <PageContainer
      title="Timeline"
      description="Your activity history"
    >
      <EmptyState
        icon={History}
        title="Nothing here yet"
        description="Your chronological activity history will be displayed here as you use RECALL."
      />
    </PageContainer>
  );
}
