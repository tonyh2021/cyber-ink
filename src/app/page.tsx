import { Workspace } from "@/components/workspace/workspace";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-root">
      <Workspace slug="seed-article" />
    </main>
  );
}
