import { describe, expect, it } from "vitest";

import { formatPostDate } from "../../src/core/dates";

describe("formatPostDate", () => {
  it("formats dates with the default locale", () => {
    expect(formatPostDate("2024-06-15")).toBe("15 June 2024");
  });

  it("accepts a custom locale", () => {
    expect(formatPostDate("2024-06-15", "en-US")).toBe("June 15, 2024");
  });
});
