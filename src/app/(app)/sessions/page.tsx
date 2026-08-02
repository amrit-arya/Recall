import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { SessionsView } from "@/components/sessions/sessions-view";
import { getSessions } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sessions",
};

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <PageContainer
      title="Sessions"
      description="Organize your active, paused, and completed work periods"
    >
      <SessionsView initialSessions={sessions} />
    </PageContainer>
  );
}
