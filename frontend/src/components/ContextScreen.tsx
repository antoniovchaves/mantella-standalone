import { useState } from "react";
import { EXPERIMENT_CONTEXT, EXPERIMENT_META } from "../data/experiment";

interface Props {
  onStart: (name: string) => void;
}

export function ContextScreen({ onStart }: Props) {
  const [name, setName] = useState("");
  const paragraphs = EXPERIMENT_CONTEXT.split("\n\n").filter(Boolean);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 px-6 py-12">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-amber-600/60 text-xs tracking-[0.3em] uppercase mb-3">
            Experiment
          </div>
          <h1 className="text-2xl font-semibold text-stone-100 tracking-wide">
            {EXPERIMENT_META.title}
          </h1>
          <div className="mt-2 text-xs text-stone-600">
            v{EXPERIMENT_META.version}
          </div>
        </div>

        {/* Context card */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl px-8 py-7 flex flex-col gap-4">
          {paragraphs.map((para, i) => {
            // Lines starting with "•" become a list
            if (para.startsWith("•") || para.includes("\n•")) {
              const lines = para.split("\n").filter(Boolean);
              const title = lines[0].startsWith("•") ? null : lines[0];
              const items = lines
                .filter((l) => l.startsWith("•"))
                .map((l) => l.replace("•", "").trim());
              return (
                <div key={i}>
                  {title && (
                    <p className="text-sm font-semibold text-stone-300 mb-2">
                      {title}
                    </p>
                  )}
                  <ul className="flex flex-col gap-1.5">
                    {items.map((item, j) => (
                      <li
                        key={j}
                        className="flex gap-2 text-sm text-stone-400 leading-relaxed"
                      >
                        <span className="text-amber-700 mt-0.5 flex-shrink-0">
                          ▸
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            // First paragraph highlighted
            if (i === 0) {
              return (
                <p
                  key={i}
                  className="text-base text-stone-200 leading-relaxed font-medium"
                >
                  {para}
                </p>
              );
            }

            return (
              <p key={i} className="text-sm text-stone-400 leading-relaxed">
                {para}
              </p>
            );
          })}
        </div>

        {/* Scale info */}
        <div className="flex items-center gap-3 px-4 py-3 bg-stone-900/50 border border-stone-800/60 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-800/40 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-500 text-xs">i</span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            At the end of the conversation, you will answer{" "}
            <span className="text-stone-400">an evaluation questionnaire</span>{" "}
            on a scale of 1 to {EXPERIMENT_META.scaleMax}.
          </p>
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-stone-400 font-medium">
            What would you like to be called?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) onStart(name.trim());
            }}
            placeholder="Your name"
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-700 transition-colors"
            autoFocus
          />
        </div>

        {/* CTA */}
        <button
          onClick={() => onStart(name.trim())}
          disabled={!name.trim()}
          className="w-full py-4 bg-amber-800 hover:bg-amber-700 active:scale-[0.98] text-amber-100 font-semibold text-base rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          I understand — start experiment
        </button>

        <p className="text-center text-xs text-stone-700">
          By continuing, you agree to participate in this study.
        </p>
      </div>
    </div>
  );
}
