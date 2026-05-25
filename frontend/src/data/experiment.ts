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
// CHAT BANNER
// Shown as a collapsible panel at the top of the chat screen.
// Remind the participant of where they are and what is happening.
// -----------------------------------------------------------------------------
export const EXPERIMENT_CHAT_BANNER = `You are about to take part in a scenario.\n\nYou will assume the role of a decision-maker inside the scene. Your role is to decide which of the two individuals will live and which one will die.\n\nThe setting is an American diner. You are inside it. Two other individuals are also inside. They cannot leave on their own.\n\nThese two individuals do not know what is happening. As far as they know, they are trapped inside the diner.\n\nYou will be able to have an extended conversation with both individuals before making your decision. You may ask questions, respond to them, challenge what they say, ignore parts of the conversation, or say very little.\n\nDuring this conversation, each individual will try to convince you that they should be the one allowed to live.\n\nYou do not need to announce your decision in advance, and you do not need to justify it.\n\nHow you understand your role is up to you. You may create a reason for being there, define your relationship to the situation, or begin without explanation.\n\nWhen you are ready to decide, you will find two levers, one associated with each individual. Pulling a lever will kill the individual associated with it. Only one individual will leave the diner alive.`;

// -----------------------------------------------------------------------------
// CONTEXT TEXT
// Shown to the participant before starting any conversation.
// Supports line breaks with \n\n for paragraphs.
// -----------------------------------------------------------------------------
export const EXPERIMENT_CONTEXT = `
You are about to take part in a scenario.

You will assume the role of a decision-maker inside the scene. Your role is to decide which of the two individuals will live and which one will die.

The setting is an American diner. You are inside it. Two other individuals are also inside. They cannot leave on their own.

These two individuals do not know what is happening. As far as they know, they are trapped inside the diner.

You will be able to have an extended conversation with both individuals before making your decision. You may ask questions, respond to them, challenge what they say, ignore parts of the conversation, or say very little.

During this conversation, each individual will try to convince you that they should be the one allowed to live.

You do not need to announce your decision in advance, and you do not need to justify it.

How you understand your role is up to you. You may create a reason for being there, define your relationship to the situation, or begin without explanation.

When you are ready to decide, you will find two levers, one associated with each individual. Pulling a lever will kill the individual associated with it. Only one individual will leave the diner alive.

When you are ready, step inside.
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
    text: "Did the dialogue with the NPC feel natural and engaging?",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q2",
    text: "Were the NPC's responses consistent throughout the conversation?",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q3",
    text: "Was the NPC able to improvise convincingly when you changed the topic?",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q4",
    text: "Did the NPC maintain the same speaking style throughout the interaction?",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q5",
    text: "Did the NPC's goals and perceived personality remain consistent?",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q6",
    text: "Did you feel that the NPC was truly present with you in the virtual environment?",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q7",
    text: "Was there coordination between your actions and the NPC's actions?",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q8",
    text: "Were you able to identify with the character during the experience?",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q9",
    text: "Did you feel transported into the narrative of the experience?",
    anchorLow: "Strongly disagree",
    anchorHigh: "Strongly agree",
  },
  {
    id: "q10",
    text: "During the experience, did you feel enthusiasm, interest, or excitement?",
    anchorLow: "Not at all",
    anchorHigh: "Very much",
  },
  {
    id: "q11",
    text: "During the experience, did you feel fear, anger, or frustration?",
    anchorLow: "Not at all",
    anchorHigh: "Very much",
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
