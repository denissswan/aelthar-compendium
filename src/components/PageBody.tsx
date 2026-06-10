"use client";

import { motion } from "framer-motion";

/**
 * Animated page-content wrapper (opacity + y slide). Lives *below* the sticky
 * AppHeader so its transform doesn't break the header's position: sticky.
 * Remounts per route, so the transition replays on every navigation.
 */
export default function PageBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
