import { describe, expect, it } from "vitest";
import { AI_MODEL, challengeModelId, chatModelId, quizModelId, resolveModelId } from "@/lib/server/ai-model";

describe("ai-model", () => {
  it("exposes a single model constant", () => {
    expect(AI_MODEL).toBe("gemini-3-flash-preview");
  });

  it("all feature resolvers return the same constant", () => {
    expect(quizModelId()).toBe(AI_MODEL);
    expect(challengeModelId()).toBe(AI_MODEL);
    expect(chatModelId()).toBe(AI_MODEL);
    expect(resolveModelId()).toBe(AI_MODEL);
  });
});
