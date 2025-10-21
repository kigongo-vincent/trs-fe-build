// components/MotionBlock.tsx
import { motion } from 'framer-motion';
import React from 'react';

const appleEase = [0.25, 0.1, 0.25, 1];

export const MotionBlock = ({
    delay = 0,
    children,
}: {
    delay?: number;
    children: React.ReactNode;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay, ease: appleEase as any }}
    >
        {children}
    </motion.div>
);
