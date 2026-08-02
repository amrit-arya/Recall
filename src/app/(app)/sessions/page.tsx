import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Sessions",
};

export default function SessionsPage() {
  return (
    <PageContainer
      title="Sessions"
      description="Track your work periods"
    >
      <EmptyState
        icon={Clock}
        title="No sessions yet"
        description="Create a session to track your work, record progress, and define next steps."
      />
    </PageContainer>
  );
}
