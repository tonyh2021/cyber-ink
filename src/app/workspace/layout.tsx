import { SidebarProvider } from "@/components/workspace/sidebar-context";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
