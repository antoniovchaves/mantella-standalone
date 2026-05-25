import type { ExperimentResult } from "../types/mantella";
import { EXPERIMENT_META } from "../data/experiment";

function clampAndRound(value: number) {
  const min = EXPERIMENT_META.scaleMin ?? 1;
  const max = EXPERIMENT_META.scaleMax ?? EXPERIMENT_META.scale ?? 5;
  const rounded = Math.round(value);
  return Math.min(Math.max(rounded, min), max);
}

export function exportAsJSON(result: ExperimentResult): void {
  const normalized = {
    ...result,
    answers: result.answers.map((a) => ({
      ...a,
      value: clampAndRound(a.value),
    })),
  };
  const blob = new Blob([JSON.stringify(normalized, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `experiment_${result.sessionId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsCSV(result: ExperimentResult): void {
  const metaRows = [
    ["sessionId", result.sessionId],
    ["startedAt", result.startedAt],
    ["endedAt", result.endedAt],
    ["conversationDuration_s", String(result.conversationDuration)],
    ["messageCount", String(result.messageCount)],
    ["npcs", result.npcs.join("; ")],
    ["playerName", result.playerName],
    ["likertMode", result.likertMode],
  ];

  const answerHeader = ["questionId", "questionText", "value"];
  const answerRows = result.answers.map((a) => [
    a.questionId,
    `"${a.questionText.replace(/"/g, '""')}"`,
    String(clampAndRound(a.value)),
  ]);

  const logHeader = ["role", "content", "timestamp"];
  const logRows = result.conversationLog.map((m) => [
    m.role,
    `"${m.content.replace(/"/g, '""')}"`,
    m.timestamp,
  ]);

  const lines = [
    "## METADATA",
    ...metaRows.map((r) => r.join(",")),
    "",
    "## QUESTIONNAIRE ANSWERS",
    answerHeader.join(","),
    ...answerRows.map((r) => r.join(",")),
    "",
    "## CONVERSATION LOG",
    logHeader.join(","),
    ...logRows.map((r) => r.join(",")),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `experiment_${result.sessionId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function saveResultToServer(
  result: ExperimentResult,
): Promise<void> {
  try {
    const normalized = {
      ...result,
      scaleMin: EXPERIMENT_META.scaleMin ?? 1,
      scaleMax: EXPERIMENT_META.scaleMax ?? EXPERIMENT_META.scale ?? 5,
      answers: result.answers.map((a) => ({
        ...a,
        value: clampAndRound(a.value),
      })),
    };

    await fetch("http://localhost:8080/save_result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });
  } catch (err) {
    // Silently fail — saving to server is best-effort
    console.warn("Failed to save result to server:", err);
  }
}
