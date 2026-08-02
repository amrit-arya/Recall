import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { MemoriesView } from "@/components/memories/memories-view";
import { getMemories, getCollections } from "@/lib/data";

export const metadata: Metadata = {
  title: "Memories",
};

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  const [memories, collections] = await Promise.all([
    getMemories(),
    getCollections(),
  ]);

  return (
    <PageContainer
      title="Memories"
      description="Everything you've captured across devices"
    >
      <MemoriesView initialMemories={memories} collections={collections} />
    </PageContainer>
  );
}
