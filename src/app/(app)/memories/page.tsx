import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { MemoriesView } from "@/components/memories/memories-view";
import { mockMemories, mockCollections } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Memories",
};

export default function MemoriesPage() {
  return (
    <PageContainer
      title="Memories"
      description="Everything you've captured across devices"
    >
      <MemoriesView initialMemories={mockMemories} collections={mockCollections} />
    </PageContainer>
  );
}
