import React, { useState } from 'react';
import type { BugInput } from '../types';
import { AlertCircle, Code2, Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface BugInputPanelProps {
    onSubmit: (input: BugInput) => void;
    isLoading: boolean;
}

const BugInputPanel: React.FC<BugInputPanelProps> = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState<BugInput>({
        errorMessage: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-xl w-full h-full flex flex-col transition-colors duration-300"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[var(--bg-color)] p-2 rounded-lg border border-[var(--border-color)]">
                    <AlertCircle className="w-6 h-6 text-[var(--text-primary)]" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Bug Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-grow">
                <div className="space-y-2 flex-grow flex flex-col">
                    <label htmlFor="errorMessage" className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                        <Code2 className="w-4 h-4" /> Error Message or Stack Trace
                    </label>
                    <textarea
                        id="errorMessage"
                        name="errorMessage"
                        required
                        placeholder="Paste your error logs, stack trace, or describe the bug here..."
                        value={formData.errorMessage}
                        onChange={handleChange}
                        className="w-full flex-grow bg-[var(--code-bg)] border border-[var(--code-border)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] rounded-lg px-4 py-3 text-[var(--text-primary)] font-mono text-sm placeholder-[var(--text-muted)] resize-none transition-colors duration-200 outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !formData.errorMessage}
                    className="mt-4 w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--accent-text)] font-semibold tracking-wide py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Analyzing Bug...</span>
                        </div>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            <span>Analyze Bug</span>
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default BugInputPanel;
