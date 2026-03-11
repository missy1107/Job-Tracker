import { validateProspect } from "../prospect-helpers";
import { PREP_ITEMS } from "../../shared/schema";

describe("prospect creation validation", () => {
  test("rejects a blank company name", () => {
    const result = validateProspect({
      companyName: "",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Company name is required");
  });

  test("rejects a blank role title", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Role title is required");
  });
});

describe("salary validation", () => {
  test("accepts a valid positive integer salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: 120000,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a salary provided as a numeric string", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: "95000",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a salary with commas and dollar sign", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: "$120,000",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts no salary (omitted)", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts null salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects a negative salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: -50000,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a positive whole number");
  });

  test("rejects a salary of zero", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: 0,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a positive whole number");
  });

  test("rejects a non-numeric salary string", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: "abc",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a positive whole number");
  });

  test("rejects a salary above the maximum", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      targetSalary: 15000000,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be $10,000,000 or less");
  });
});

describe("prep checklist validation", () => {
  const base = { companyName: "Google", roleTitle: "Software Engineer" };
  const allFalse = Array(PREP_ITEMS.length).fill(false);
  const allTrue = Array(PREP_ITEMS.length).fill(true);
  const mixed = [true, false, true, false];

  test("accepts a valid all-false checklist", () => {
    const result = validateProspect({ ...base, prepChecklist: allFalse });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a valid all-true checklist", () => {
    const result = validateProspect({ ...base, prepChecklist: allTrue });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a valid mixed checklist", () => {
    const result = validateProspect({ ...base, prepChecklist: mixed });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts null checklist (no checklist set)", () => {
    const result = validateProspect({ ...base, prepChecklist: null });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts omitted checklist", () => {
    const result = validateProspect({ ...base });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects checklist with wrong number of items", () => {
    const result = validateProspect({ ...base, prepChecklist: [true, false] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(`Prep checklist must have exactly ${PREP_ITEMS.length} items`);
  });

  test("rejects an empty checklist array", () => {
    const result = validateProspect({ ...base, prepChecklist: [] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(`Prep checklist must have exactly ${PREP_ITEMS.length} items`);
  });

  test("rejects checklist with non-boolean values", () => {
    const result = validateProspect({
      ...base,
      prepChecklist: [1, 0, 1, 0],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Prep checklist items must be booleans");
  });

  test("rejects checklist that is not an array", () => {
    const result = validateProspect({ ...base, prepChecklist: "done" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Prep checklist must be an array");
  });

  test("checklist state is independent per prospect (different checklist values are distinct)", () => {
    const prospect1Result = validateProspect({ ...base, prepChecklist: [true, false, false, false] });
    const prospect2Result = validateProspect({ ...base, prepChecklist: [false, true, true, false] });
    expect(prospect1Result.valid).toBe(true);
    expect(prospect2Result.valid).toBe(true);
  });

  test("PREP_ITEMS has exactly 4 items matching expected tasks", () => {
    expect(PREP_ITEMS).toHaveLength(4);
    expect(PREP_ITEMS).toContain("Research company");
    expect(PREP_ITEMS).toContain("Review job description");
    expect(PREP_ITEMS).toContain("Prepare strong stories");
    expect(PREP_ITEMS).toContain("Prepare questions to ask");
  });
});
