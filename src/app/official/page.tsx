import type { Metadata } from "next";
import { OfficialLandingPage } from "@/components/official/OfficialLandingPage";

export const metadata: Metadata = {
  title: "InboxPilot | Instagram automation for modern teams",
  description:
    "InboxPilot helps creators, sellers, and teams automate Instagram replies, organize conversations, and turn comments into qualified leads.",
};

export default function OfficialPage() {
  return <OfficialLandingPage />;
}
