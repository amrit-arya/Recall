import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { SessionsView } from "@/components/sessions/sessions-view";
import { mockSessions } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Sessions",
};

export default function SessionsPage() {
  return (
    <PageContainer
      title="Sessions"
      description="Organize your active, paused, and completed work periods"
    >
      <SessionsView initialSessions={mockSessions} />
    </PageContainer>
  );
}
