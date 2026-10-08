// ============================================================
// Service – Three-Way Matching
// Pure business logic: compares PO / GR / Invoice
// No UI dependencies – can be called from any layer
// ============================================================

import { ThreeWayMatchResult, Exception } from '../types';
import { MOCK_PURCHASE_ORDERS } from '../data/purchaseOrders';
import { MOCK_GOODS_RECEIPTS } from '../data/goodsReceipts';
import { MOCK_INVOICES } from '../data/invoices';

const TOLERANCE_PCT = 0.5; // 0.5% price tolerance before flagging mismatch

export function computeThreeWayMatch(exception: Exception): ThreeWayMatchResult | null {
  const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === exception.poId);
  const gr = exception.grId
    ? MOCK_GOODS_RECEIPTS.find((g) => g.id === exception.grId)
    : undefined;
  const invoice = MOCK_INVOICES.find((i) => i.id === exception.invoiceId);

  if (!po || !invoice) return null;

  // Use first line item for single-line match; multi-line shown separately
  const poLine = po.lineItems[0];
  const grLine = gr?.lineItems[0];
  const invLine = invoice.lineItems[0];

  if (!poLine || !invLine) return null;

  // ── Quantity ──────────────────────────────────────────────
  const grQty = grLine?.quantityReceived ?? 0;
  const invQty = invLine.quantity;
  const poQty = poLine.quantity;

  const quantityVariance = invQty - grQty;
  const quantityVariancePct = grQty > 0 ? (quantityVariance / grQty) * 100 : 100;
  const quantityMatch = !gr
    ? false
    : Math.abs(quantityVariancePct) <= TOLERANCE_PCT;

  // ── Price ─────────────────────────────────────────────────
  const poPrice = poLine.unitPrice;
  const invPrice = invLine.unitPrice;
  const priceVariance = invPrice - poPrice;
  const priceVariancePct = poPrice > 0 ? (priceVariance / poPrice) * 100 : 100;
  const priceMatch = Math.abs(priceVariancePct) <= TOLERANCE_PCT;

  // ── Amount ────────────────────────────────────────────────
  const poAmount = poLine.totalAmount;
  const invAmount = invLine.totalAmount;
  const amountVariance = invAmount - poAmount;
  const amountVariancePct = poAmount > 0 ? (amountVariance / poAmount) * 100 : 100;
  const amountMatch = Math.abs(amountVariancePct) <= TOLERANCE_PCT;

  // ── Overall ───────────────────────────────────────────────
  let overallStatus: ThreeWayMatchResult['overallStatus'];
  if (!gr) {
    overallStatus = 'GR Missing';
  } else if (quantityMatch && priceMatch && amountMatch) {
    overallStatus = 'Matched';
  } else if (!quantityMatch && !priceMatch) {
    overallStatus = 'Mismatch';
  } else {
    overallStatus = 'Partial Match';
  }

  return {
    exceptionId: exception.id,
    poLineItem: poLine,
    grLineItem: grLine,
    invoiceLineItem: invLine,
    quantityMatch,
    priceMatch,
    amountMatch,
    quantityVariance,
    priceVariance,
    amountVariance,
    quantityVariancePct,
    priceVariancePct,
    amountVariancePct,
    overallStatus,
  };
}

export function computeMultiLineMatch(exception: Exception): ThreeWayMatchResult[] {
  const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === exception.poId);
  const gr = exception.grId
    ? MOCK_GOODS_RECEIPTS.find((g) => g.id === exception.grId)
    : undefined;
  const invoice = MOCK_INVOICES.find((i) => i.id === exception.invoiceId);

  if (!po || !invoice) return [];

  return po.lineItems.map((poLine) => {
    const grLine = gr?.lineItems.find((g) => g.lineNumber === poLine.lineNumber);
    const invLine = invoice.lineItems.find((i) => i.lineNumber === poLine.lineNumber);

    if (!invLine) {
      return {
        exceptionId: exception.id,
        poLineItem: poLine,
        grLineItem: grLine,
        invoiceLineItem: { ...poLine, quantity: 0, unitPrice: 0, totalAmount: 0, taxRate: 0, taxAmount: 0 },
        quantityMatch: false,
        priceMatch: false,
        amountMatch: false,
        quantityVariance: -poLine.quantity,
        priceVariance: -poLine.unitPrice,
        amountVariance: -poLine.totalAmount,
        quantityVariancePct: -100,
        priceVariancePct: -100,
        amountVariancePct: -100,
        overallStatus: 'Mismatch' as const,
      };
    }

    const grQty = grLine?.quantityReceived ?? 0;
    const quantityVariance = invLine.quantity - grQty;
    const quantityVariancePct = grQty > 0 ? (quantityVariance / grQty) * 100 : 100;
    const quantityMatch = !gr ? false : Math.abs(quantityVariancePct) <= TOLERANCE_PCT;

    const priceVariance = invLine.unitPrice - poLine.unitPrice;
    const priceVariancePct = poLine.unitPrice > 0 ? (priceVariance / poLine.unitPrice) * 100 : 100;
    const priceMatch = Math.abs(priceVariancePct) <= TOLERANCE_PCT;

    const amountVariance = invLine.totalAmount - poLine.totalAmount;
    const amountVariancePct = poLine.totalAmount > 0 ? (amountVariance / poLine.totalAmount) * 100 : 100;
    const amountMatch = Math.abs(amountVariancePct) <= TOLERANCE_PCT;

    let overallStatus: ThreeWayMatchResult['overallStatus'];
    if (!gr) overallStatus = 'GR Missing';
    else if (quantityMatch && priceMatch && amountMatch) overallStatus = 'Matched';
    else if (!quantityMatch && !priceMatch) overallStatus = 'Mismatch';
    else overallStatus = 'Partial Match';

    return {
      exceptionId: exception.id,
      poLineItem: poLine,
      grLineItem: grLine,
      invoiceLineItem: invLine,
      quantityMatch,
      priceMatch,
      amountMatch,
      quantityVariance,
      priceVariance,
      amountVariance,
      quantityVariancePct,
      priceVariancePct,
      amountVariancePct,
      overallStatus,
    };
  });
}
