import { validateProspect } from "../prospect-helpers";

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
