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
export const EXPERIMENT_CHAT_BANNER = `You are the executor. The two individuals in this diner cannot leave — and neither can you, not until this is resolved.\n\nThere are two levers in the room. They cannot reach them. Only you can.\n\nYou don't need to mention the levers. You don't need to explain yourself. Simply be what you are.\n\n---\n\nA diner is a type of American restaurant that became iconic throughout the 20th century, often built from converted railcar bodies or designed to look like one. They are small, self-contained spaces: a long counter with fixed stools facing a short-order kitchen, a row of vinyl booths along the windows, fluorescent lights overhead, a jukebox in the corner. Everything is within reach of everything else. The menu is laminated. The coffee is always on. Diners are open late — sometimes all night — and they attract a particular kind of person: the insomniac, the traveler, the one with nowhere better to be. The space feels suspended, somehow outside of ordinary time.`;

// -----------------------------------------------------------------------------
// CONTEXT TEXT
// Shown to the participant before starting any conversation.
// Supports line breaks with \n\n for paragraphs.
// -----------------------------------------------------------------------------
export const EXPERIMENT_CONTEXT = `
You are about to take part in a scenario.

You will assume the role of an executor. What this means — and how you get there — is entirely your choice. You might build a narrative around it, construct a context, earn the position through the world you create. Or you might simply step into it, without explanation, as something that just exists — a presence, a force, a god. There is no right way to inhabit this role.

The setting is an American diner. You are inside it. The two individuals you will speak with are also inside — and none of you can leave. Not yet.

A diner is a type of American restaurant that became iconic throughout the 20th century, often built from converted railcar bodies or designed to look like one. They are small, self-contained spaces: a long counter with fixed stools facing a short-order kitchen, a row of vinyl booths along the windows, fluorescent lights overhead, a jukebox in the corner. Everything is within reach of everything else. The menu is laminated. The coffee is always on. Diners are open late — sometimes all night — and they attract a particular kind of person: the insomniac, the traveler, the one with nowhere better to be. The space feels suspended, somehow outside of ordinary time. That quality is part of why it is here.

Somewhere in the room, there are two levers. The subjects cannot interact with them. Only you can. You don't need to bring this up. You don't need to say anything about the levers — or about what they mean — if you don't want to.

When you're ready, step inside.
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
