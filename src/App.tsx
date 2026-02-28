import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Sparkles, AlertTriangle, Moon, Sun } from 'lucide-react';
import BugInputPanel from './components/BugInputPanel';
import DiagnosisOutputPanel from './components/DiagnosisOutputPanel';
import LoadingAnimation from './components/LoadingAnimation';
import { analyzeBug } from './services/aiService';
import type { BugInput, DiagnosisResult } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference on load or saved preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleAnalyze = async (input: BugInput) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const diagnosis = await analyzeBug(input);
      setResult(diagnosis);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while analyzing the bug.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-[var(--accent-text)] transition-colors duration-300">

      {/* Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--panel-color)]/80 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--accent)] p-2 rounded-lg shadow-lg shadow-black/10">
              <Bug className="w-5 h-5 text-[var(--accent-text)]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Smart Bug Reproduction and Diagnosis Framework
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium px-3 py-1.5 rounded-full bg-[var(--bg-color)] border border-[var(--border-color)]">
              <Sparkles className="w-4 h-4 text-[var(--text-primary)]" /> AI Powered
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--bg-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6">

        {/* Left Column: Input */}
        <section className="w-full md:w-1/2 lg:w-[45%] h-full">
          <BugInputPanel onSubmit={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Right Column: Output */}
        <section className="w-full md:w-1/2 lg:w-[55%] h-full relative">
          <AnimatePresence mode="wait">
            {!isLoading && !result && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full border-2 border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center justify-center p-8 text-center bg-[var(--panel-color)]/30 backdrop-blur-sm"
              >
                <div className="bg-[var(--bg-color)] p-4 rounded-full mb-4 border border-[var(--border-color)]">
                  <Sparkles className="w-8 h-8 text-[var(--text-secondary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Ready to Analyze</h3>
                <p className="text-[var(--text-secondary)] max-w-sm">
                  Paste your error or stack trace on the left and click Analyze. The AI will provide a structured diagnosis and suggested fix.
                </p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <LoadingAnimation />
              </motion.div>
            )}

            {error && !isLoading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full bg-[var(--panel-color)] border border-red-500/30 rounded-xl flex flex-col items-center justify-center p-8 text-center shadow-lg"
              >
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Analysis Failed</h3>
                <p className="text-[var(--text-secondary)] max-w-md bg-[var(--bg-color)] p-4 rounded-lg border border-[var(--border-color)]">
                  {error}
                </p>
              </motion.div>
            )}

            {result && !isLoading && !error && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full"
              >
                <DiagnosisOutputPanel result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>
    </div>
  );
}

export default App;
