import type { Metadata } from "next";
import WorkspaceDashboard from "./WorkspaceDashboard";

export const metadata: Metadata = {
  title: "Creator Workspace — Creator Coaching AI",
  description: "나의 크리에이터 워크스페이스",
};

export default function WorkspacePage() {
  return <WorkspaceDashboard />;
}
