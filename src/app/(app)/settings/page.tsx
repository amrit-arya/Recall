import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Settings as SettingsIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      description="Preferences and configuration"
    >
      <EmptyState
        icon={SettingsIcon}
        title="Settings"
        description="Profile, theme, AI preferences, and data management will be available here."
      />
    </PageContainer>
  );
}
