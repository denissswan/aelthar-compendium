"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Reusable bottom drawer: blurred dim backdrop + spring slide-up, capped at 85dvh. */
export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-h-[85dvh] max-w-app overflow-y-auto rounded-t-2xl border-t border-border bg-surface-2 pb-[env(safe-area-inset-bottom)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="sticky top-0 flex justify-center bg-surface-2 pt-3">
              <span className="h-1 w-10 rounded-full bg-fg-dim" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
