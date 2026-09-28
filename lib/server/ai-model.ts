// Module: centralized AI model identity for quiz/challenge/chat generation.
//
// Interface: a single constant (AI_MODEL) plus thin per-feature resolvers.
// Seam: route modules import the model id from here instead of hardcoding it,
// so a model change touches exactly one place.
// Adapter note: each route keeps its existing SDK call style (GoogleGenAI vs
// ai-sdk/google); this module only supplies the model identity string.

export const AI_MODEL = "gemini-3-flash-preview";

export function quizModelId(): string {
  return AI_MODEL;
}

export function challengeModelId(): string {
  return AI_MODEL;
}

export function chatModelId(): string {
  return AI_MODEL;
}

export function resolveModelId(): string {
  return AI_MODEL;
}
