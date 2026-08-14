import { describe, expect, it } from "vitest";
import { buildImagePromptInstruction, ensureSketchStyle, STYLE_MODIFIERS } from "./prompt-templates";

describe("buildImagePromptInstruction", () => {
  it("includes every required style modifier", () => {
    const instruction = buildImagePromptInstruction();
    for (const modifier of STYLE_MODIFIERS) {
      expect(instruction).toContain(modifier);
    }
  });
});

describe("ensureSketchStyle", () => {
  it("appends every modifier when the prompt has none of them", () => {
    const result = ensureSketchStyle("a lone figure walking through a foggy forest");

    for (const modifier of STYLE_MODIFIERS) {
      expect(result.toLowerCase()).toContain(modifier.toLowerCase());
    }
  });

  it("does not duplicate modifiers that are already present", () => {
    const alreadyStyled = `${STYLE_MODIFIERS.join(", ")}, a lone figure walking through a foggy forest, ${STYLE_MODIFIERS.join(", ")}`;
    const result = ensureSketchStyle(alreadyStyled);

    for (const modifier of STYLE_MODIFIERS) {
      const occurrences = result.toLowerCase().split(modifier.toLowerCase()).length - 1;
      expect(occurrences).toBe(2);
    }
  });

  it("only appends the specific modifiers that are missing", () => {
    const partiallyStyled = "pencil sketch, monochromatic, a lone figure walking through a foggy forest";
    const result = ensureSketchStyle(partiallyStyled);

    expect(result.toLowerCase().match(/pencil sketch/g)).toHaveLength(1);
    expect(result.toLowerCase()).toContain("graphite sketch");
    expect(result.toLowerCase()).toContain("cross-hatching for shading");
  });

  it("strips chromatic color words while preserving the required black/white/monochrome terms", () => {
    const result = ensureSketchStyle(
      "a red door beside a blue lake, golden light, black and white sketch, monochromatic"
    );

    expect(result.toLowerCase()).not.toMatch(/\bred\b/);
    expect(result.toLowerCase()).not.toMatch(/\bblue\b/);
    expect(result.toLowerCase()).not.toMatch(/\bgolden\b/);
    expect(result.toLowerCase()).toContain("black and white sketch");
    expect(result.toLowerCase()).toContain("monochromatic");
  });

  it("produces clean punctuation without leftover double commas after stripping colors", () => {
    const result = ensureSketchStyle("a red, blue, and golden sunset over the hills");
    expect(result).not.toMatch(/,\s*,/);
    expect(result).not.toMatch(/^\s*,/);
    expect(result).not.toMatch(/,\s*$/);
  });
});
