import type { ExperimentResult } from '../types/mantella';

export function exportAsJSON(result: ExperimentResult): void {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `experimento_${result.sessionId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsCSV(result: ExperimentResult): void {
  const metaRows = [
    ['sessionId', result.sessionId],
    ['startedAt', result.startedAt],
    ['endedAt', result.endedAt],
    ['conversationDuration_s', String(result.conversationDuration)],
    ['messageCount', String(result.messageCount)],
    ['npcs', result.npcs.join('; ')],
    ['playerName', result.playerName],
    ['likertMode', result.likertMode],
  ];

  const answerHeader = ['questionId', 'questionText', 'value'];
  const answerRows = result.answers.map((a) => [
    a.questionId,
    `"${a.questionText.replace(/"/g, '""')}"`,
    String(a.value),
  ]);

  const logHeader = ['role', 'content', 'timestamp'];
  const logRows = result.conversationLog.map((m) => [
    m.role,
    `"${m.content.replace(/"/g, '""')}"`,
    m.timestamp,
  ]);

  const lines = [
    '## METADADOS',
    ...metaRows.map((r) => r.join(',')),
    '',
    '## RESPOSTAS DO QUESTIONÁRIO',
    answerHeader.join(','),
    ...answerRows.map((r) => r.join(',')),
    '',
    '## LOG DA CONVERSA',
    logHeader.join(','),
    ...logRows.map((r) => r.join(',')),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `experimento_${result.sessionId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
