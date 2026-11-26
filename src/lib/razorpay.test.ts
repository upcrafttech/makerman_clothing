import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildRazorpayMethodRestriction } from "./razorpay.ts";

describe("buildRazorpayMethodRestriction", () => {
  it("enables only UPI when UPI is selected", () => {
    assert.deepEqual(buildRazorpayMethodRestriction("upi"), {
      upi: true,
      card: false,
      netbanking: false,
      wallet: false,
      emi: false,
      paylater: false,
    });
  });

  it("enables only card when card is selected", () => {
    const restriction = buildRazorpayMethodRestriction("card");
    assert.equal(restriction.card, true);
    assert.equal(restriction.upi, false);
    assert.equal(restriction.netbanking, false);
  });

  it("enables only net banking when net banking is selected", () => {
    const restriction = buildRazorpayMethodRestriction("netbanking");
    assert.equal(restriction.netbanking, true);
    assert.equal(restriction.upi, false);
    assert.equal(restriction.card, false);
  });
});
