"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Landing from "@/components/Landing";
import ChatView from "@/components/ChatView";
import Stage4 from "@/components/Stage4";
import { CoachingProvider } from "@/store/CoachingContext";

export default function Home() {
  const [stage, setStage] = useState<"landing" | "chat" | "stage4">("landing");

  return (
    <CoachingProvider>
      <main className="min-h-dvh bg-background">
        {stage === "landing" && (
          <div className="flex items-center justify-center min-h-dvh p-6">
            <div className="w-full max-w-[480px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key="landing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Landing onStart={() => setStage("chat")} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {stage === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ChatView onComplete={() => setStage("stage4")} />
          </motion.div>
        )}

        {stage === "stage4" && (
          <div className="flex items-center justify-center min-h-dvh p-6">
            <div className="w-full max-w-[480px]">
              <motion.div
                key="stage4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Stage4 />
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </CoachingProvider>
  );
}
