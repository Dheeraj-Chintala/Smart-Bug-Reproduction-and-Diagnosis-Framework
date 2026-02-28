import React from 'react';
import type { DiagnosisResult } from '../types';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Terminal,
    Lightbulb,
    ListChecks,
    ShieldCheck,
    Activity,
    Copy,
    Check
} from 'lucide-react';

interface DiagnosisOutputPanelProps {
    result: DiagnosisResult;
}

const SectionReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        {children}
    </motion.div>
);

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-slate-700/50 rounded-md transition-colors text-slate-400 hover:text-white group relative"
            title="Copy to clipboard"
        >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
    );
};

const DiagnosisOutputPanel: React.FC<DiagnosisOutputPanelProps> = ({ result }) => {
    // If it's classified as unrelated, we show a special UI
    if (result.classification === "Unrelated Request" || result.classification.toLowerCase().includes("unrelated")) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--panel-color)] border border-red-500/30 rounded-xl p-8 shadow-xl w-full h-full flex flex-col items-center justify-center text-center min-h-[500px] transition-colors duration-300"
            >
                <div className="bg-red-500/10 p-4 rounded-full mb-6">
                    <Terminal className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">Unrelated Request</h2>
                <p className="text-[var(--text-secondary)] max-w-md bg-[var(--bg-color)] p-6 rounded-lg border border-[var(--border-color)] leading-relaxed">
                    {result.explanation || "This tool is specifically designed to diagnose software bugs, code errors, and architectural issues. Please provide a valid bug report or stack trace."}
                </p>
            </motion.div>
        );
    }

    // Determine confidence color
    let confidenceColor = "bg-green-500";
    if (result.confidence_score < 60) confidenceColor = "bg-red-500";
    else if (result.confidence_score < 85) confidenceColor = "bg-yellow-500";

    return (
        <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-xl w-full h-full flex flex-col overflow-hidden max-h-full transition-colors duration-300">
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--border-color)] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--bg-color)] p-2 rounded-lg border border-[var(--border-color)]">
                        <Activity className="w-6 h-6 text-[var(--accent)]" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Diagnosis Report</h2>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Confidence</span>
                    <div className="flex items-center gap-2 bg-[var(--bg-color)] px-3 py-1.5 rounded-full border border-[var(--border-color)]">
                        <div className="w-16 h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${result.confidence_score}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={`h-full ${confidenceColor}`}
                            />
                        </div>
                        <span className="text-sm font-bold text-[var(--text-primary)]">{result.confidence_score}%</span>
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6">

                {/* Title & Severity */}
                <SectionReveal delay={0.05}>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{result.title}</h3>
                            <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider border ${result.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                result.severity === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                    result.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20' :
                                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20'
                                }`}>
                                {result.severity.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </SectionReveal>

                {/* Classification & Root Cause */}
                <SectionReveal delay={0.1}>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold uppercase tracking-wider mb-3">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Classification
                                </span>
                                <CopyButton text={result.classification} />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--accent)] mb-2 tracking-tight">{result.classification}</h3>
                            <p className="text-[var(--text-primary)] leading-relaxed font-medium">
                                {result.root_cause}
                            </p>
                        </div>
                    </div>
                </SectionReveal>

                {/* Detailed Explanation */}
                <SectionReveal delay={0.2}>
                    <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-5">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
                                <Terminal className="w-5 h-5 text-[var(--text-secondary)]" /> Technical Explanation
                            </h4>
                            <CopyButton text={result.explanation} />
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                            {result.explanation}
                        </p>
                    </div>
                </SectionReveal>

                {/* Suggested Fix */}
                <SectionReveal delay={0.3}>
                    <div className="bg-[var(--bg-color)] border border-emerald-500/20 rounded-lg p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 tracking-tight">
                                <Lightbulb className="w-5 h-5" /> Suggested Fix
                            </h4>
                            <CopyButton text={result.suggested_fix} />
                        </div>
                        <div className="text-sm text-[var(--text-primary)] font-mono bg-[var(--code-bg)] p-4 rounded-md border border-[var(--code-border)] whitespace-pre-wrap overflow-x-auto">
                            {result.suggested_fix}
                        </div>
                    </div>
                </SectionReveal>

                {/* Repro Steps & Prevention */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SectionReveal delay={0.4}>
                        <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-5 h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
                                    <ListChecks className="w-4 h-4 text-[var(--text-secondary)]" /> Reproduction Steps
                                </h4>
                                <CopyButton text={result.reproduction_steps.join('\n')} />
                            </div>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-secondary)]">
                                {result.reproduction_steps.map((step, i) => (
                                    <li key={i} className="pl-1 leading-relaxed">{step}</li>
                                ))}
                            </ol>
                        </div>
                    </SectionReveal>

                    <SectionReveal delay={0.5}>
                        <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-5 h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
                                    <ShieldCheck className="w-4 h-4 text-[var(--text-secondary)]" /> Prevention Strategy
                                </h4>
                                <CopyButton text={result.prevention_strategy} />
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {result.prevention_strategy}
                            </p>
                        </div>
                    </SectionReveal>
                </div>

            </div>
        </div>
    );
};

export default DiagnosisOutputPanel;
