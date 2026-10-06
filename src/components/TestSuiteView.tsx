/**
 * Elemental Wildguard - Automated Test Suite Dashboard
 * Live interactive execution and inspection of all Section 10 & 11 PRD test cases.
 */

import React, { useState, useEffect } from 'react';
import { runAllPRDTests, TestResultItem, TestSuiteSummary } from '../game/testing/testSuite';
import { CheckCircle2, XCircle, Play, RotateCcw, Filter, Check, Clock } from 'lucide-react';
import { sound } from '../game/audio/soundSynthesizer';

export const TestSuiteView: React.FC = () => {
  const [summary, setSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const executeTests = () => {
    sound.playClick();
    setIsRunning(true);
    setTimeout(() => {
      const res = runAllPRDTests();
      setSummary(res);
      setIsRunning(false);
      if (res.failed === 0) {
        sound.playVictory();
      }
    }, 100);
  };

  useEffect(() => {
    // Run tests automatically on mount
    const res = runAllPRDTests();
    setSummary(res);
  }, []);

  const categories = summary
    ? ['All', ...Array.from(new Set(summary.results.map((r) => r.category)))]
    : ['All'];

  const filteredResults = summary
    ? summary.results.filter((r) => {
        if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
        return true;
      })
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">
            PRD v2.2 Automated Verification Test Suite
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic evaluation of mathematical models, balance rules, and edge case compliance.
          </p>
        </div>

        <button
          onClick={executeTests}
          disabled={isRunning}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
            isRunning
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
          }`}
        >
          <RotateCcw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Executing Tests...' : 'Re-run All Tests'}</span>
        </button>
      </div>

      {/* Summary Scorecard */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Total Test Cases</span>
            <span className="text-2xl font-mono font-bold text-white mt-1">
              {summary.total}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tests Passed
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {summary.passed}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400" /> Tests Failed
            </span>
            <span className="text-2xl font-mono font-bold text-rose-400 mt-1">
              {summary.failed}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Execution Time
            </span>
            <span className="text-2xl font-mono font-bold text-amber-300 mt-1">
              {summary.durationMs.toFixed(1)}ms
            </span>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sound.playClick();
              setCategoryFilter(cat);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Test Results Table / Cards */}
      <div className="flex flex-col gap-2">
        {filteredResults.map((t) => (
          <div
            key={t.id}
            className={`border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
              t.passed
                ? 'bg-slate-900/60 border-slate-800/80'
                : 'bg-rose-950/30 border-rose-800/80'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3">
              <div className="shrink-0 mt-0.5 sm:mt-0">
                {t.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-amber-400">{t.id}</span>
                  <span className="text-xs font-semibold text-white">{t.name}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {t.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{t.details}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs shrink-0 self-end sm:self-center">
              {t.expected !== undefined && (
                <div className="font-mono text-slate-400 text-[11px] text-right">
                  <div>Expected: <span className="text-slate-200">{String(t.expected)}</span></div>
                  <div>Actual: <span className="text-emerald-300">{String(t.actual)}</span></div>
                </div>
              )}
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  t.passed ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                }`}
              >
                {t.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
