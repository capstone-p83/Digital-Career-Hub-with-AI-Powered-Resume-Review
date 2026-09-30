const test = require("node:test");
const assert = require("node:assert/strict");

const {
  sanitizePersonalInfo,
} = require("../services/privacy/sanitizePersonalInfo");

test("redacts email addresses", () => {
  const result = sanitizePersonalInfo(
    "Contact me at nathasha@example.com"
  );

  assert.equal(
    result,
    "Contact me at [EMAIL REDACTED]"
  );
});

test("redacts Australian phone numbers", () => {
  const result = sanitizePersonalInfo(
    "Phone: 0412 345 678"
  );

  assert.equal(
    result,
    "Phone: [PHONE REDACTED]"
  );
});

test("redacts LinkedIn profile URLs", () => {
  const result = sanitizePersonalInfo(
    "LinkedIn: https://linkedin.com/in/nathasha"
  );

  assert.equal(
    result,
    "LinkedIn: [LINKEDIN REDACTED]"
  );
});

test("redacts a known user name", () => {
  const result = sanitizePersonalInfo(
    "Nathasha Delgoda is a software developer.",
    { name: "Nathasha Delgoda" }
  );

  assert.equal(
    result,
    "[NAME REDACTED] is a software developer."
  );
});

test("preserves non-personal resume information", () => {
  const result = sanitizePersonalInfo(
    "Bachelor of Computer Science and JavaScript experience"
  );

  assert.equal(
    result,
    "Bachelor of Computer Science and JavaScript experience"
  );
});