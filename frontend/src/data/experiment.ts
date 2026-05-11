// =============================================================================
// EXPERIMENT CONFIGURATION
// Edit this file to customize the context and questions.
// =============================================================================

export interface LikertQuestion {
  id: string;
  text: string;
  anchorLow: string; // left-end label (e.g. "Strongly disagree")
  anchorHigh: string; // right-end label (e.g. "Strongly agree")
}

// -----------------------------------------------------------------------------
// CONTEXT TEXT
// Shown to the participant before starting any conversation.
// Supports line breaks with \n\n for paragraphs.
// -----------------------------------------------------------------------------
export const EXPERIMENT_CONTEXT = `
Welcome to the NPC dialogue evaluation experiment.

In this study, you will have a conversation with a character via a chat interface. The character is controlled by a large language model (LLM) integrated with the Mantella system.

Your goal is to have a natural conversation with the character. There are no right or wrong answers — we want to understand how you perceive the experience of interacting with this type of character.

After the conversation, you will answer a brief questionnaire about your experience.

Instructions:
• Have a normal conversation with the character for at least 5 messages
• When you feel the conversation has reached a natural ending point, click "End experiment"
• Then answer the questionnaire honestly

This experiment has an estimated duration of 10 to 15 minutes.

Thank you for participating!
`.trim();

// -----------------------------------------------------------------------------
// QUESTIONNAIRE QUESTIONS
// Each question has: unique id, text, low anchor and high anchor.
// For a 7-point Likert scale:
//   Range: continuous slider from 1 to 7
//   Classic: buttons labeled 1–7
// -----------------------------------------------------------------------------
export const QUESTIONNAIRE: LikertQuestion[] = [
  {
    id: "q1",
    text: "The character seemed to understand what I meant.",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q2",
    text: "The character's responses were consistent with their personality.",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q3",
    text: "The conversation felt natural and fluid.",
    anchorLow: "Completely artificial",
    anchorHigh: "Completely natural",
  },
  {
    id: "q4",
    text: 'I felt like I was talking to a character that "exists" in the world.',
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q5",
    text: "The experience was satisfying.",
    anchorLow: "Not at all satisfying",
    anchorHigh: "Very satisfying",
  },
  {
    id: "q6",
    text: "I was emotionally engaged with the character during the conversation.",
    anchorLow: "No engagement",
    anchorHigh: "High engagement",
  },
  {
    id: "q7",
    text: "I would like to have conversations like this with other characters.",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
];

// -----------------------------------------------------------------------------
// EXPERIMENT METADATA
// Included in the exported JSON/CSV.
// -----------------------------------------------------------------------------
export const EXPERIMENT_META = {
  title: "NPC Dialogue Evaluation via LLM",
  version: "1.0",
  scale: 5, // Likert scale points
  scaleMin: 1,
  scaleMax: 5,
};
