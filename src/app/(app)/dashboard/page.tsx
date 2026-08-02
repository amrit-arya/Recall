import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Home",
};

export default function DashboardPage() {
  return (
    <PageContainer
      title="Home"
      description="Your personal dashboard"
    >
      <EmptyState
        icon={Home}
        title="Welcome to RECALL"
        description="Your dashboard will show recent memories, active sessions, and quick capture once data is connected."
      />
    </PageContainer>
  );
}
