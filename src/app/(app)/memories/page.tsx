import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { MemoriesView } from "@/components/memories/memories-view";
import { getMemories, getCollections, getTags } from "@/lib/data";

export const metadata: Metadata = {
  title: "Memories",
};

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  const [memories, collections, allTags] = await Promise.all([
    getMemories(),
    getCollections(),
    getTags(),
  ]);

  return (
    <PageContainer
      title="Memories"
      description="Everything you've captured across devices"
    >
      <MemoriesView
        initialMemories={memories}
        collections={collections}
        allTags={allTags}
      />
    </PageContainer>
  );
}
