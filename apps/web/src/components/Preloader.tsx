"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for basic hydration and resources
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[var(--ink)]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            {/* Simple SVG text drawing for "వాణి" */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 100 100"
              className="text-[var(--turmeric)]"
            >
              <motion.text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="40"
                fontFamily="var(--font-serif)"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                initial={{ strokeDasharray: "0 100", opacity: 0 }}
                animate={{ strokeDasharray: "100 0", opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                వాణి
              </motion.text>
            </svg>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-[2px] bg-[var(--turmeric)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
