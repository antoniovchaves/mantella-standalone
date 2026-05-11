import { useState } from "react";
import type { LikertMode, ExperimentResult } from "../types/mantella";
import { QUESTIONNAIRE, EXPERIMENT_META } from "../data/experiment";
import { exportAsJSON, exportAsCSV } from "../services/exportUtils";

interface Props {
  result: Omit<ExperimentResult, "answers" | "likertMode">;
  onDone: () => void;
}

const SCALE = EXPERIMENT_META.scale; // 7
const POINTS = Array.from({ length: SCALE }, (_, i) => i + 1);

// ── Range question ────────────────────────────────────────────────────────────
function RangeQuestion({
  question,
  value,
  onChange,
}: {
  question: (typeof QUESTIONNAIRE)[0];
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-stone-200 leading-relaxed">{question.text}</p>
      <div className="flex flex-col gap-1.5">
        <input
          type="range"
          min={1}
          max={5}
          step={0.01}
          value={value ?? 3}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-stone-500">
          <span>{question.anchorLow}</span>
          <span
            className={`font-semibold text-xs transition-colors ${value != null ? "text-amber-400" : "text-stone-600"}`}
          >
            {value != null ? value.toFixed(2) : "—"}
          </span>
          <span>{question.anchorHigh}</span>
        </div>
        {/* tick reference points */}
        <div className="flex justify-between px-[2px]">
          {POINTS.map((p) => (
            <span key={p} className="text-[9px] w-4 text-center text-stone-700">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Classic Likert question ───────────────────────────────────────────────────
function ClassicQuestion({
  question,
  value,
  onChange,
}: {
  question: (typeof QUESTIONNAIRE)[0];
  value: number | null;
  onChange: (v: number) => void;
}) {
  const labels: Record<number, string> = {
    1: question.anchorLow,
    3: "Neutral",
    5: question.anchorHigh,
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-stone-200 leading-relaxed">{question.text}</p>
      <div className="flex gap-1.5 justify-between">
        {POINTS.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg border transition-all duration-100
              ${
                value === p
                  ? "bg-amber-800 border-amber-700 text-amber-100"
                  : "bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-600 hover:text-stone-300"
              }`}
          >
            <span className="text-sm font-semibold">{p}</span>
            {labels[p] && (
              <span className="text-[8px] leading-tight text-center px-0.5 opacity-70">
                {labels[p]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Questionnaire screen ─────────────────────────────────────────────────
export function QuestionnaireScreen({ result, onDone }: Props) {
  const [mode, setMode] = useState<LikertMode>("range");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [exported, setExported] = useState<null | "json" | "csv" | "both">(
    null,
  );

  const allAnswered = QUESTIONNAIRE.every((q) => answers[q.id] != null);
  const progress = Object.keys(answers).length / QUESTIONNAIRE.length;

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function buildResult(): ExperimentResult {
    return {
      ...result,
      likertMode: mode,
      answers: QUESTIONNAIRE.map((q) => ({
        questionId: q.id,
        questionText: q.text,
        value: answers[q.id] ?? 0,
      })),
    };
  }

  function handleExportJSON() {
    exportAsJSON(buildResult());
    setExported((prev) => (prev === "csv" ? "both" : "json"));
  }

  function handleExportCSV() {
    exportAsCSV(buildResult());
    setExported((prev) => (prev === "json" ? "both" : "csv"));
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 px-6 py-12">
        <div className="w-full max-w-lg flex flex-col items-center gap-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center">
            <span className="text-emerald-400 text-2xl">✓</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-stone-100 mb-2">
              Questionnaire complete
            </h2>
            <p className="text-sm text-stone-500">
              Thank you for your participation. Export the results below.
            </p>
          </div>

          {/* Summary */}
          <div className="w-full bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
              Answer summary
            </h3>
            {QUESTIONNAIRE.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-xs text-stone-400 flex-1 leading-relaxed">
                  {q.text}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* mini bar */}
                  <div className="w-20 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-700 rounded-full transition-all"
                      style={{
                        width: `${((answers[q.id] - 1) / (SCALE - 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-amber-400 w-10 text-right">
                    {answers[q.id].toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-stone-800 flex justify-between text-xs text-stone-500">
              <span>Average</span>
              <span className="text-stone-300 font-semibold">
                {(
                  Object.values(answers).reduce((a, b) => a + b, 0) /
                  QUESTIONNAIRE.length
                ).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Export buttons */}
          <div className="w-full flex flex-col gap-3">
            <p className="text-xs text-stone-600">Export results</p>
            <div className="flex gap-3">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-3 border border-stone-700 hover:border-stone-500 text-stone-300 text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {exported === "json" || exported === "both" ? "✓ " : ""}JSON
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 py-3 border border-stone-700 hover:border-stone-500 text-stone-300 text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {exported === "csv" || exported === "both" ? "✓ " : ""}CSV
              </button>
            </div>
            <button
              onClick={onDone}
              className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm rounded-xl transition-colors"
            >
              Finish and restart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-stone-950 px-6 py-10 overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {/* Header */}
        <div>
          <div className="text-amber-600/60 text-xs tracking-[0.3em] uppercase mb-2">
            Questionnaire
          </div>
          <h2 className="text-xl font-semibold text-stone-100">
            Rate your experience
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Indicate your agreement with each statement below (scale of 1 to{" "}
            {SCALE}).
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-stone-600">
            <span>
              {Object.keys(answers).length} of {QUESTIONNAIRE.length} answered
            </span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-700 rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl p-1 self-start">
          <button
            onClick={() => setMode("range")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === "range"
                ? "bg-amber-800 text-amber-100"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            Slider (range)
          </button>
          <button
            onClick={() => setMode("classic")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === "classic"
                ? "bg-amber-800 text-amber-100"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            Classic Likert
          </button>
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-8">
          {QUESTIONNAIRE.map((q, i) => (
            <div
              key={q.id}
              className={`bg-stone-900 border rounded-xl px-5 py-5 transition-colors ${
                answers[q.id] != null ? "border-stone-700" : "border-stone-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-stone-600 w-5">
                  {i + 1}.
                </span>
                {answers[q.id] != null && (
                  <span className="text-[10px] text-emerald-600 ml-auto">
                    ✓ answered
                  </span>
                )}
              </div>
              {mode === "range" ? (
                <RangeQuestion
                  question={q}
                  value={answers[q.id] ?? null}
                  onChange={(v) => setAnswer(q.id, v)}
                />
              ) : (
                <ClassicQuestion
                  question={q}
                  value={answers[q.id] ?? null}
                  onChange={(v) => setAnswer(q.id, v)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
          className="w-full py-4 bg-amber-800 hover:bg-amber-700 disabled:opacity-30 disabled:cursor-not-allowed text-amber-100 font-semibold text-base rounded-xl transition-all active:scale-[0.98]"
        >
          {allAnswered
            ? "Submit answers"
            : `Answer all ${QUESTIONNAIRE.length} questions to continue`}
        </button>

        <div className="h-8" />
      </div>
    </div>
  );
}
