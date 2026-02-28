import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingAnimation: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-xl p-8 shadow-xl w-full h-full flex flex-col items-center justify-center min-h-[500px] transition-colors duration-300"
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="mb-6 text-[var(--text-secondary)]"
            >
                <Loader2 className="w-12 h-12" />
            </motion.div>

            <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Analyzing Bug...</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-8 text-center max-w-sm">
                The AI is reading your stack trace, identifying the root cause, and formulating a fix.
            </p>

            <div className="w-full max-w-md space-y-4">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 1,
                            delay: i * 0.2
                        }}
                        className="h-16 w-full bg-[var(--bg-color)] rounded-lg border border-[var(--border-color)]"
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default LoadingAnimation;
