import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderSummary, getAvailableCoupons } from '../src/couponSelector.js';

const sampleCoupons = [
  { id: 'a', minimumSpend: 100, discountAmount: 10 },
  { id: 'b', minimumSpend: 300, discountAmount: 50 }
];

test('marks coupons available only when the order meets the minimum spend', () => {
  const states = getAvailableCoupons(120, sampleCoupons);

  assert.equal(states[0].available, true);
  assert.equal(states[0].unavailableReason, '');
  assert.equal(states[1].available, false);
  assert.match(states[1].unavailableReason, /还差/);
});

test('applies the selected available coupon to the payable total', () => {
  const summary = calculateOrderSummary(120, 'a', sampleCoupons);

  assert.equal(summary.discount, 10);
  assert.equal(summary.payableTotal, 110);
  assert.equal(summary.selectedCoupon.id, 'a');
});

test('ignores selected coupons that do not meet the minimum spend', () => {
  const summary = calculateOrderSummary(120, 'b', sampleCoupons);

  assert.equal(summary.discount, 0);
  assert.equal(summary.payableTotal, 120);
  assert.equal(summary.selectedCoupon, null);
});
