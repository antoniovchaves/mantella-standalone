// =============================================================================
// TUTORIAL NPC LINES
// Dialogue delivered by the tutorial NPC before entering the experiment.
// Organised as ordered stages — each stage is one conversation checkpoint.
// Each line is ≤ 149 characters.
// =============================================================================

export interface TutorialStage {
  id: string;
  label: string;
  lines: string[];
}

export const TUTORIAL_NPC_STAGES: TutorialStage[] = [
  {
    id: "intro",
    label: "Introduction & A button",
    lines: [
      "Welcome. I'll teach you everything you need to know to use this VR scenario.",
      "First, the A button. It is on your right controller.",
      "You should feel two round buttons near your thumb. The A button is the lower one.",
      "Press A to move through dialogue. You can also press it while someone is speaking to skip to the next line.",
      "Try pressing A now to continue through this explanation.",
    ],
  },
  {
    id: "movement",
    label: "Movement",
    lines: [
      "Good. Now let's practice movement.",
      "Use the movement control to walk around the area.",
      "Try walking to the marked spot, then come back and talk to me again.",
    ],
  },
  {
    id: "camera",
    label: "Camera",
    lines: [
      "Nice. Now let's practice the camera.",
      "Use the camera control to look around and adjust your view.",
      "Try looking around, then come back to me.",
    ],
  },
  {
    id: "grab",
    label: "Grab — leaving conversations",
    lines: [
      "Great. Now let's talk about grab.",
      "Grab is on the handle of your controller, where your fingers rest.",
      "In this scenario, grab lets you step out of conversations.",
      "Try using grab now to leave this conversation. Then come talk to me again.",
    ],
  },
  {
    id: "lever",
    label: "Grab — objects & levers",
    lines: [
      "Perfect. Grab also lets you interact with physical objects in the environment.",
      "You can use it to hold, move, or activate certain objects.",
      "Try using grab on that lever for me.",
    ],
  },
  {
    id: "closing",
    label: "Closing",
    lines: [
      "Great. That is everything you need.",
      "You know how to press A, move around, control the camera, and use grab.",
      "Remember: grab lets you leave conversations and interact with physical objects.",
      "When you are ready, continue to the next part.",
    ],
  },
];

// Flat array — useful if the VR system needs a single sequential list
export const TUTORIAL_NPC_LINES_FLAT: string[] = TUTORIAL_NPC_STAGES.flatMap(
  (stage) => stage.lines,
);
