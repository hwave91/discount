export const coupons = [
  {
    id: 'new-user-20',
    title: '新人专享券',
    description: '新用户首单满 100 元可用',
    discountLabel: '¥20',
    minimumSpend: 100,
    discountAmount: 20,
    expiresAt: '2026-12-31'
  },
  {
    id: 'summer-15',
    title: '夏日特惠券',
    description: '满 150 元立减 15 元',
    discountLabel: '¥15',
    minimumSpend: 150,
    discountAmount: 15,
    expiresAt: '2026-08-31'
  },
  {
    id: 'vip-50',
    title: '会员大额券',
    description: '会员订单满 300 元可用',
    discountLabel: '¥50',
    minimumSpend: 300,
    discountAmount: 50,
    expiresAt: '2026-10-31'
  }
];

const currencyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 2
});

export function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

export function getAvailableCoupons(orderTotal, couponList = coupons) {
  return couponList.map((coupon) => ({
    ...coupon,
    available: orderTotal >= coupon.minimumSpend,
    unavailableReason: orderTotal >= coupon.minimumSpend
      ? ''
      : `还差 ${formatCurrency(coupon.minimumSpend - orderTotal)} 可用`
  }));
}

export function calculateOrderSummary(orderTotal, selectedCouponId, couponList = coupons) {
  const selectedCoupon = couponList.find((coupon) => coupon.id === selectedCouponId);
  const canApply = Boolean(selectedCoupon && orderTotal >= selectedCoupon.minimumSpend);
  const discount = canApply ? selectedCoupon.discountAmount : 0;
  return {
    orderTotal,
    selectedCoupon: canApply ? selectedCoupon : null,
    discount,
    payableTotal: Math.max(orderTotal - discount, 0)
  };
}

export function createCouponSelector({ root, orderTotal = 268, couponList = coupons }) {
  if (!root) {
    throw new Error('createCouponSelector requires a root element.');
  }

  let selectedCouponId = '';

  function render() {
    const couponStates = getAvailableCoupons(orderTotal, couponList);
    const summary = calculateOrderSummary(orderTotal, selectedCouponId, couponStates);

    root.innerHTML = `
      <section class="coupon-panel" aria-labelledby="coupon-title">
        <div class="order-card">
          <span class="eyebrow">订单金额</span>
          <strong class="order-total">${formatCurrency(orderTotal)}</strong>
        </div>
        <div class="section-heading">
          <h1 id="coupon-title">选择优惠券</h1>
          <p>选择一张可用优惠券，系统会自动计算应付金额。</p>
        </div>
        <div class="coupon-list" role="radiogroup" aria-label="优惠券列表">
          ${couponStates.map((coupon) => `
            <label class="coupon-card ${coupon.available ? '' : 'is-disabled'} ${summary.selectedCoupon?.id === coupon.id ? 'is-selected' : ''}">
              <input
                type="radio"
                name="coupon"
                value="${coupon.id}"
                ${coupon.available ? '' : 'disabled'}
                ${summary.selectedCoupon?.id === coupon.id ? 'checked' : ''}
              />
              <span class="coupon-value">${coupon.discountLabel}</span>
              <span class="coupon-content">
                <strong>${coupon.title}</strong>
                <small>${coupon.description}</small>
                <em>有效期至 ${coupon.expiresAt}</em>
                ${coupon.unavailableReason ? `<b>${coupon.unavailableReason}</b>` : ''}
              </span>
            </label>
          `).join('')}
        </div>
        <button class="clear-button" type="button" ${summary.selectedCoupon ? '' : 'disabled'}>不使用优惠券</button>
        <dl class="summary-card">
          <div><dt>商品小计</dt><dd>${formatCurrency(summary.orderTotal)}</dd></div>
          <div><dt>优惠抵扣</dt><dd class="discount">-${formatCurrency(summary.discount)}</dd></div>
          <div class="payable"><dt>应付金额</dt><dd>${formatCurrency(summary.payableTotal)}</dd></div>
        </dl>
      </section>
    `;

    root.querySelectorAll('input[name="coupon"]').forEach((input) => {
      input.addEventListener('change', (event) => {
        selectedCouponId = event.target.value;
        render();
      });
    });

    root.querySelector('.clear-button').addEventListener('click', () => {
      selectedCouponId = '';
      render();
    });
  }

  render();

  return {
    selectCoupon(couponId) {
      selectedCouponId = couponId;
      render();
    },
    updateOrderTotal(nextTotal) {
      orderTotal = nextTotal;
      render();
    }
  };
}
