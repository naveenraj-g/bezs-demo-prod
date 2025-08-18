"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { HistoryIcon, Settings, SquarePen } from "lucide-react";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useFilterStore } from "../stores/useFilterStore";
import { useChatContext } from "../context/chat/context";
import { HistorySidebar } from "./side-bar";

export const Topbar = () => {
  const { createSession } = useChatContext();
  const router = useRouter();
  const openSettings = useSettingsStore((state) => state.open);
  const openChatHistory = useFilterStore((state) => state.open);

  async function handleCreateSession() {
    const newSession = await createSession();
    if (newSession?.id) {
      router.push(`/bezs/ai-hub/ask-ai/${newSession.id}`);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Button size="sm" variant="outline" onClick={handleCreateSession}>
          <SquarePen /> New Chat
        </Button>
        <Button size="sm" variant="outline" onClick={openSettings}>
          <Settings className="w-4 h-4" /> Settings
        </Button>
      </div>
      <div className="flex gap-2 items-center">
        <Button size="sm" variant="outline" onClick={openChatHistory}>
          <HistoryIcon className="w-4 h-4" /> History{" "}
          <span className="bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded-md text-xs">
            Ctrl K
          </span>
        </Button>
        <HistorySidebar />
      </div>
    </div>
  );
};
