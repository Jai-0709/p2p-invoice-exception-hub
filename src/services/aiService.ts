// ============================================================
// Service – Mock AI Assistant
// Deterministic/rule-based AI service grounded in exception data
// Clearly labelled as mock AI – NOT a real LLM
// In production: replace with SAP Joule / Google Gemini / OpenAI API
// ============================================================

import { Exception, AIInsight } from '../types';
import { MOCK_SUPPLIERS } from '../data/suppliers';
import { MOCK_PURCHASE_ORDERS } from '../data/purchaseOrders';
import { MOCK_INVOICES } from '../data/invoices';
import { MOCK_GOODS_RECEIPTS } from '../data/goodsReceipts';
import { formatCurrency, formatDate, DEMO_TODAY } from '../utils/formatting';
import { computeMultiLineMatch } from './matchingService';

export function generateAIInsight(exception: Exception): AIInsight {
  const supplier = MOCK_SUPPLIERS.find((s) => s.id === exception.supplierId);
  const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === exception.poId);
  const invoice = MOCK_INVOICES.find((i) => i.id === exception.invoiceId);
  const gr = exception.grId
    ? MOCK_GOODS_RECEIPTS.find((g) => g.id === exception.grId)
    : undefined;
  const matchResults = computeMultiLineMatch(exception);

  const evidence: string[] = [];

  // Build evidence list from actual data
  if (po) {
    po.lineItems.forEach((line) => {
      evidence.push(
        `PO ${po.id} Line ${line.lineNumber}: ${line.materialDescription} × ${line.quantity} ${line.unit} @ ${formatCurrency(line.unitPrice, po.currency)} = ${formatCurrency(line.totalAmount, po.currency)}`
      );
    });
  }
  if (gr) {
    gr.lineItems.forEach((line) => {
      evidence.push(
        `GR ${gr.id} Line ${line.lineNumber}: ${line.quantityReceived} ${line.unit} received on ${formatDate(line.receiptDate)} (Quality: ${line.qualityStatus})`
      );
    });
  } else {
    evidence.push(`No Goods Receipt found for PO ${exception.poId}`);
  }
  if (invoice) {
    invoice.lineItems.forEach((line) => {
      evidence.push(
        `Invoice ${invoice.id} Line ${line.lineNumber}: ${line.quantity} ${line.unit} @ ${formatCurrency(line.unitPrice, invoice.currency)} = ${formatCurrency(line.totalAmount, invoice.currency)} (Tax: ${line.taxRate}%)`
      );
    });
  }

  // Add match results
  matchResults.forEach((match) => {
    if (!match.quantityMatch) {
      evidence.push(
        `Quantity mismatch on Line ${match.poLineItem.lineNumber}: Invoice ${match.invoiceLineItem.quantity} vs GR ${match.grLineItem?.quantityReceived ?? 0} (variance: ${match.quantityVariance > 0 ? '+' : ''}${match.quantityVariance} = ${match.quantityVariancePct.toFixed(1)}%)`
      );
    }
    if (!match.priceMatch) {
      evidence.push(
        `Price mismatch on Line ${match.poLineItem.lineNumber}: Invoice ${formatCurrency(match.invoiceLineItem.unitPrice, invoice?.currency ?? 'GBP')} vs PO ${formatCurrency(match.poLineItem.unitPrice, po?.currency ?? 'GBP')} (variance: ${match.priceVariancePct > 0 ? '+' : ''}${match.priceVariancePct.toFixed(1)}%)`
      );
    }
  });

  if (supplier && !supplier.masterDataComplete) {
    evidence.push(`Supplier BP-${supplier.id}: Master data flagged as incomplete (missing bank/tax data)`);
  }

  evidence.push(`Exception age: ${exception.ageingDays} days (Bucket: ${exception.ageingBucket})`);
  evidence.push(`SLA status: ${exception.slaBreached ? 'BREACHED' : 'Within SLA'}`);
  evidence.push(`Financial exposure: ${formatCurrency(exception.financialExposure, exception.currency)}`);

  // Generate summary from exception type
  const summary = buildSummary(exception, supplier?.name ?? 'Unknown Supplier', po, invoice, gr);
  const explanation = buildExplanation(exception, matchResults);
  const recommendation = exception.recommendedAction;

  return {
    summary,
    explanation,
    recommendation,
    evidence,
    confidence: computeConfidence(exception),
    generatedAt: DEMO_TODAY.toISOString(),
  };
}

function buildSummary(
  ex: Exception,
  supplierName: string,
  po: ReturnType<typeof MOCK_PURCHASE_ORDERS.find>,
  invoice: ReturnType<typeof MOCK_INVOICES.find>,
  gr: ReturnType<typeof MOCK_GOODS_RECEIPTS.find>
): string {
  const amt = formatCurrency(ex.financialExposure, ex.currency);

  switch (ex.exceptionType) {
    case 'PO/Invoice Quantity Mismatch':
      return `${supplierName} submitted invoice ${invoice?.supplierInvoiceNumber ?? ''} for ${invoice?.lineItems[0].quantity ?? 0} units, but only ${gr?.lineItems[0].quantityReceived ?? 0} units were received per GR ${gr?.id ?? 'N/A'}. Quantity variance creates a ${amt} overstatement. Invoice is currently payment-blocked.`;

    case 'PO/Invoice Price Mismatch':
      return `Invoice from ${supplierName} totals ${amt}, exceeding PO value of ${formatCurrency(po?.totalAmount ?? 0, po?.currency ?? 'GBP')}. Price discrepancy detected on ${po?.lineItems.length ?? 1} line item(s). Invoice is payment-blocked pending price validation.`;

    case 'Goods Receipt Missing':
      return `Invoice ${invoice?.supplierInvoiceNumber ?? ''} from ${supplierName} for ${amt} was received on ${formatDate(invoice?.invoiceDate ?? '')} but no corresponding Goods Receipt exists in SAP for PO ${po?.id ?? ''}. Three-way match cannot be completed without GR confirmation.`;

    case 'Supplier Master Data Missing':
      return `Supplier ${supplierName} (${ex.supplierId}) has incomplete master data in SAP. Invoice ${invoice?.supplierInvoiceNumber ?? ''} for ${amt} cannot be processed until bank account details and tax classification are validated and updated.`;

    case 'Incorrect Company Code':
      return `Invoice ${invoice?.supplierInvoiceNumber ?? ''} (${amt}) was posted to Company Code ${invoice?.companyCode ?? ''}, but the associated PO ${po?.id ?? ''} belongs to Company Code ${po?.companyCode ?? ''}. An inter-company correction posting is required.`;

    case 'Duplicate Invoice':
      return `Invoice ${invoice?.supplierInvoiceNumber ?? ''} from ${supplierName} appears to be a duplicate submission. The same supplier invoice number has already been processed and paid. Potential duplicate payment risk of ${amt}.`;

    case 'Approval Pending':
      return `Invoice ${invoice?.supplierInvoiceNumber ?? ''} from ${supplierName} for ${amt} is awaiting final approval. Three-way match is complete. Payment is blocked until authorised approver signs off.`;

    case 'Payment Block':
      return `Invoice ${invoice?.supplierInvoiceNumber ?? ''} from ${supplierName} for ${amt} has an active payment block (Code: ${invoice?.paymentBlock ?? 'Unknown'}). The reason for the block must be investigated before payment can proceed.`;

    case 'Tax/Amount Mismatch':
      return `Invoice ${invoice?.supplierInvoiceNumber ?? ''} from ${supplierName} contains a tax rate discrepancy. The applied tax rate does not match the expected rate for the material/jurisdiction. Tax overstatement detected.`;

    default:
      return `Exception ${ex.id} requires investigation. Financial exposure: ${amt}. Ageing: ${ex.ageingDays} days.`;
  }
}

function buildExplanation(
  ex: Exception,
  matchResults: ReturnType<typeof computeMultiLineMatch>
): string {
  switch (ex.exceptionType) {
    case 'PO/Invoice Quantity Mismatch':
      return `During the three-way matching process, the system compared the quantities on the Purchase Order, Goods Receipt, and Supplier Invoice. The invoice quantity exceeded the confirmed received quantity in SAP, creating an automatic payment block. This typically occurs when a supplier invoices for the full PO quantity before all goods have been delivered and received at the plant.`;

    case 'PO/Invoice Price Mismatch':
      return `The SAP three-way match engine detected that unit prices on the supplier invoice differ from the contracted prices on the Purchase Order. This can occur due to unannounced price increases, incorrect pricing by the supplier, or a PO that was not updated to reflect agreed price changes. A tolerance check of 0.5% is applied; variances beyond this threshold trigger automatic blocking.`;

    case 'Goods Receipt Missing':
      return `The SAP invoice matching process requires a posted Goods Receipt (MIGO) before an invoice can be cleared for payment under standard three-way match configuration. No GR document has been posted for PO ${ex.poId}. This may indicate that goods were physically received but not yet posted in SAP, or that the goods have not yet arrived.`;

    case 'Supplier Master Data Missing':
      return `SAP's vendor master data validation detected that supplier ${ex.supplierId} has incomplete records. Specifically, bank account details and/or tax classification data are missing or unverified. Without complete master data, payment cannot be processed as the bank transfer would fail, and tax reporting would be incomplete.`;

    case 'Incorrect Company Code':
      return `The invoice was entered into SAP under Company Code ${ex.companyCode}, but the referenced Purchase Order belongs to a different Company Code. This can occur when invoices are entered by the wrong entity in a multi-company-code environment. The posting creates an intercompany imbalance and compliance risk.`;

    case 'Duplicate Invoice':
      return `SAP's duplicate invoice check (configured via MIRO) detected that the supplier invoice number matches an invoice that has already been processed. Duplicate invoices are a common source of double payment in P2P processes. This exception requires manual verification before any further action.`;

    case 'Approval Pending':
      return `The invoice has passed the three-way match but requires a manual approval step due to its value exceeding the automatic approval threshold, or because a manual payment block was set requiring sign-off. The assigned approver must review and release the block.`;

    case 'Payment Block':
      return `A manual payment block has been applied to this invoice in SAP. Payment blocks can be set for various reasons including audit holds, contractual disputes, or pending credit notes. The block code must be investigated to determine the appropriate action.`;

    case 'Tax/Amount Mismatch':
      return `The VAT/tax rate applied on the supplier invoice does not match the expected tax code for this material, plant, or country of supply. This creates a discrepancy in the gross invoice amount compared to the tax-exclusive net amount. An incorrect tax rate can lead to VAT return errors if the invoice is processed without correction.`;

    default:
      return `The exception was detected during the P2P processing cycle at the ${ex.detectedAtStage} stage. Manual investigation is required.`;
  }
}

function computeConfidence(ex: Exception): number {
  // Higher confidence when we have complete data
  let conf = 70;
  if (ex.grId) conf += 10;
  if (ex.financialExposure > 0) conf += 5;
  if (ex.ageingDays > 0) conf += 5;
  if (ex.slaBreached) conf += 5;
  if (ex.ownerId) conf += 5;
  return Math.min(conf, 99);
}
