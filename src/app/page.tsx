"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Landing from "@/components/Landing";
import ChatView from "@/components/ChatView";
import { CoachingProvider } from "@/store/CoachingContext";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <CoachingProvider>
      <main className="min-h-dvh bg-background">
        {!started ? (
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
                  <Landing onStart={() => setStarted(true)} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ChatView />
          </motion.div>
        )}
      </main>
    </CoachingProvider>
  );
}
