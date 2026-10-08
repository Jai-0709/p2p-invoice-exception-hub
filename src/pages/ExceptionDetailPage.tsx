// ============================================================
// Exception Detail Page – All 17 sections
// ============================================================

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock, User, FileText,
  Package, Truck, BarChart2, Zap, MessageSquare, History, Shield,
  ChevronDown, ChevronUp, Send, Brain, ThumbsUp, ThumbsDown, Edit3,
  Building, CreditCard, RefreshCw, ExternalLink,
} from 'lucide-react';
import { useExceptionStore } from '../store/exceptionStore';
import { useAuthStore } from '../store/authStore';
import { MOCK_SUPPLIERS } from '../data/suppliers';
import { MOCK_PURCHASE_ORDERS } from '../data/purchaseOrders';
import { MOCK_GOODS_RECEIPTS } from '../data/goodsReceipts';
import { MOCK_INVOICES } from '../data/invoices';
import { MOCK_USERS } from '../data/users';
import {
  formatCurrency, formatDate, formatDateTime, STATUS_COLORS,
  PRIORITY_COLORS, riskScoreColor,
} from '../utils/formatting';
import { computeMultiLineMatch } from '../services/matchingService';
import { generateAIInsight } from '../services/aiService';
import { getRiskScoreBreakdown } from '../services/riskService';
import { getAvailableTransitions } from '../services/workflowService';
import { updateException } from '../services/exceptionService';

const P2P_STAGES = [
  'Purchase Requisition',
  'Purchase Order',
  'Goods Receipt',
  'Invoice Receipt',
  'Three-Way Matching',
  'Exception Detection',
  'Investigation',
  'Assignment / Approval',
  'Resolution',
  'Payment',
];

export const ExceptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const {
    selectedException, comments, auditEntries,
    selectException, doChangeStatus, doAssign, doAddComment, error, clearError,
  } = useExceptionStore();

  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [workflowNote, setWorkflowNote] = useState('');
  const [selectedTransitionTo, setSelectedTransitionTo] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [aiInsight, setAiInsight] = useState<ReturnType<typeof generateAIInsight> | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'loaded'>('idle');
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id) selectException(id);
  }, [id]);

  if (!selectedException) {
    return (
      <div className="loading-overlay">
        {error
          ? <><AlertTriangle size={32} color="var(--color-error)" /><span style={{ color: 'var(--text-muted)' }}>{error}</span><button className="btn btn-secondary" onClick={() => navigate('/exceptions')}>Back to Queue</button></>
          : <><div className="spinner spinner-lg" /><span style={{ color: 'var(--text-muted)' }}>Loading exception…</span></>
        }
      </div>
    );
  }

  const exc = selectedException;
  const supplier = MOCK_SUPPLIERS.find(s => s.id === exc.supplierId);
  const po = MOCK_PURCHASE_ORDERS.find(p => p.id === exc.poId);
  const gr = exc.grId ? MOCK_GOODS_RECEIPTS.find(g => g.id === exc.grId) : null;
  const invoice = MOCK_INVOICES.find(i => i.id === exc.invoiceId);
  const owner = MOCK_USERS.find(u => u.id === exc.ownerId);
  const matchResults = computeMultiLineMatch(exc);
  const riskBreakdown = getRiskScoreBreakdown(exc);
  const transitions = getAvailableTransitions(exc.status, currentUser?.role ?? 'AP Clerk');

  // Determine P2P stage index
  const detectedIdx = P2P_STAGES.indexOf(exc.detectedAtStage);
  const statusToStageIdx: Record<string, number> = {
    Open: 5, 'Under Review': 6, Assigned: 7, 'Pending Approval': 7, Resolved: 8, Rejected: 8,
  };
  const currentStageIdx = statusToStageIdx[exc.status] ?? detectedIdx;

  const loadAI = () => {
    setAiLoading(true);
    setTimeout(() => {
      const insight = generateAIInsight(exc);
      setAiInsight(insight);
      setAiLoading(false);
      setAiStatus('loaded');
    }, 900);
  };

  const handleComment = () => {
    if (!commentText.trim()) { setCommentError('Please enter a comment.'); return; }
    if (commentText.length > 1000) { setCommentError('Comment must be under 1000 characters.'); return; }
    setCommentError('');
    doAddComment(exc.id, currentUser!.id, commentText.trim());
    setCommentText('');
  };

  const handleStatusChange = () => {
    if (!selectedTransitionTo) return;
    doChangeStatus(exc.id, selectedTransitionTo as any, currentUser!.id, workflowNote || undefined);
    setShowWorkflowModal(false);
    setWorkflowNote('');
    setSelectedTransitionTo('');
  };

  const handleAssign = () => {
    if (!selectedOwnerId) return;
    doAssign(exc.id, selectedOwnerId, currentUser!.id);
    setShowAssignModal(false);
    setSelectedOwnerId('');
  };

  const handleAIAction = (action: 'accept' | 'reject' | 'edit') => {
    updateException(exc.id, { aiRecommendationStatus: action === 'accept' ? 'Accepted' : action === 'reject' ? 'Rejected' : 'Edited' });
    selectException(exc.id);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="detail-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/exceptions')} style={{ marginTop: 4 }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 className="page-title" style={{ fontSize: 20 }}>{exc.id}</h1>
              <span className={`badge badge-status-${exc.status.replace(/ /g, '-').toLowerCase()}`} style={{ fontSize: 12 }}>
                <span className="badge-dot" style={{ background: STATUS_COLORS[exc.status] }} />
                {exc.status}
              </span>
              <span className={`badge badge-priority-${exc.priority.toLowerCase()}`} style={{ fontSize: 12 }}>
                {exc.priority} Priority
              </span>
              {exc.slaBreached && (
                <span className="badge badge-status-rejected" style={{ fontSize: 12 }}>
                  ⚠ SLA Breached
                </span>
              )}
            </div>
            <div className="page-subtitle" style={{ marginTop: 4 }}>
              {exc.exceptionType} · {exc.material} · {formatDate(exc.createdDate)}
            </div>
          </div>
        </div>
        <div className="page-actions">
          {transitions.length > 0 && (
            <button id="workflow-btn" className="btn btn-primary btn-sm" onClick={() => setShowWorkflowModal(true)}>
              <RefreshCw size={13} /> Change Status
            </button>
          )}
          <button id="assign-btn" className="btn btn-secondary btn-sm" onClick={() => setShowAssignModal(true)}>
            <User size={13} /> Assign
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={15} /> {error}
          <button className="btn btn-ghost btn-sm" onClick={clearError} style={{ marginLeft: 'auto' }}>✕</button>
        </div>
      )}

      {/* P2P Process Timeline */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title"><BarChart2 size={16} /> P2P Process Timeline</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Exception detected at: <strong style={{ color: 'var(--priority-high)' }}>{exc.detectedAtStage}</strong></span>
        </div>
        <div className="process-timeline">
          {P2P_STAGES.map((stage, i) => {
            const isCompleted = i < detectedIdx;
            const isException = i === detectedIdx;
            const isActive = i > detectedIdx && i <= currentStageIdx;
            const cls = isException ? 'exception' : isCompleted ? 'completed' : isActive ? 'active' : '';
            return (
              <div key={stage} className={`timeline-step ${cls}`}>
                <div className="timeline-dot">
                  {isCompleted && <CheckCircle size={10} color="white" />}
                  {isException && <AlertTriangle size={10} color="white" />}
                  {isActive && <Clock size={10} color="white" />}
                </div>
                <span className="timeline-label">{stage}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="detail-grid">
        {/* LEFT COLUMN */}
        <div>
          {/* Section 1 – Exception Overview */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title"><AlertTriangle size={16} /> Exception Overview</span>
            </div>
            <div className="detail-section">
              <div className="detail-row"><span className="detail-label">Exception ID</span><span className="detail-value" style={{ fontFamily: 'monospace' }}>{exc.id}</span></div>
              <div className="detail-row"><span className="detail-label">Exception Type</span><span className="detail-value">{exc.exceptionType}</span></div>
              <div className="detail-row"><span className="detail-label">Document Reference</span><span className="detail-value" style={{ fontFamily: 'monospace' }}>{exc.documentReference}</span></div>
              <div className="detail-row"><span className="detail-label">Company Code</span><span className="detail-value">{exc.companyCode}</span></div>
              <div className="detail-row"><span className="detail-label">Plant</span><span className="detail-value">{exc.plant}</span></div>
              <div className="detail-row"><span className="detail-label">Storage Location</span><span className="detail-value">{exc.storageLocation}</span></div>
              <div className="detail-row"><span className="detail-label">Cost Centre</span><span className="detail-value">{exc.costCentre}</span></div>
              <div className="detail-row"><span className="detail-label">Material</span><span className="detail-value">{exc.material}</span></div>
              <div className="detail-row"><span className="detail-label">Detected At Stage</span><span className="detail-value" style={{ color: 'var(--priority-high)' }}>{exc.detectedAtStage}</span></div>
              <div className="detail-row"><span className="detail-label">Created Date</span><span className="detail-value">{formatDate(exc.createdDate)}</span></div>
              <div className="detail-row"><span className="detail-label">Last Updated</span><span className="detail-value">{formatDate(exc.updatedDate)}</span></div>
              {exc.resolvedDate && <div className="detail-row"><span className="detail-label">Resolved Date</span><span className="detail-value" style={{ color: 'var(--color-success)' }}>{formatDate(exc.resolvedDate)}</span></div>}
              <div className="detail-row"><span className="detail-label">SLA Due Date</span><span className="detail-value" style={{ color: exc.slaBreached ? 'var(--color-error)' : 'var(--text-primary)' }}>{formatDate(exc.dueDate)}</span></div>
            </div>
          </div>

          {/* Section 2 – Supplier */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title"><Building size={16} /> Supplier Information</span>
              {supplier && !supplier.masterDataComplete && (
                <span className="badge badge-status-rejected">Master Data Incomplete</span>
              )}
            </div>
            {supplier ? (
              <div className="detail-section">
                <div className="detail-row"><span className="detail-label">Supplier Name</span><span className="detail-value">{supplier.name}</span></div>
                <div className="detail-row"><span className="detail-label">BP Number</span><span className="detail-value" style={{ fontFamily: 'monospace' }}>{supplier.id}</span></div>
                <div className="detail-row"><span className="detail-label">Country / City</span><span className="detail-value">{supplier.country} · {supplier.city}</span></div>
                <div className="detail-row"><span className="detail-label">Payment Terms</span><span className="detail-value">{supplier.paymentTerms}</span></div>
                <div className="detail-row"><span className="detail-label">Currency</span><span className="detail-value">{supplier.currency}</span></div>
                <div className="detail-row"><span className="detail-label">Tax Number</span><span className="detail-value" style={{ fontFamily: 'monospace' }}>{supplier.taxNumber}</span></div>
                <div className="detail-row"><span className="detail-label">Contact</span><span className="detail-value">{supplier.contactName}</span></div>
                <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value" style={{ fontSize: 11 }}>{supplier.contactEmail}</span></div>
                <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{supplier.contactPhone}</span></div>
                <div className="detail-row"><span className="detail-label">Supplier Rating</span>
                  <span className="detail-value">
                    <span className={`badge badge-priority-${supplier.rating === 'A' ? 'low' : supplier.rating === 'B' ? 'medium' : 'high'}`}>{supplier.rating}</span>
                  </span>
                </div>
                <div className="detail-row"><span className="detail-label">Master Data</span>
                  <span className={`badge ${supplier.masterDataComplete ? 'badge-match' : 'badge-mismatch'}`}>
                    {supplier.masterDataComplete ? '✓ Complete' : '✗ Incomplete'}
                  </span>
                </div>
              </div>
            ) : <div style={{ color: 'var(--text-muted)', padding: 16 }}>Supplier not found</div>}
          </div>

          {/* Section 3 – Invoice */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title"><CreditCard size={16} /> Invoice Information</span>
              {invoice && <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{invoice.id}</span>}
            </div>
            {invoice ? (
              <div className="detail-section">
                <div className="detail-row"><span className="detail-label">SAP Document</span><span className="detail-value" style={{ fontFamily: 'monospace' }}>{invoice.id}</span></div>
                <div className="detail-row"><span className="detail-label">Supplier Invoice No.</span><span className="detail-value" style={{ fontFamily: 'monospace' }}>{invoice.supplierInvoiceNumber}</span></div>
                <div className="detail-row"><span className="detail-label">Invoice Date</span><span className="detail-value">{formatDate(invoice.invoiceDate)}</span></div>
                <div className="detail-row"><span className="detail-label">Posting Date</span><span className="detail-value">{formatDate(invoice.postingDate)}</span></div>
                <div className="detail-row"><span className="detail-label">Due Date</span><span className="detail-value">{formatDate(invoice.dueDate)}</span></div>
                <div className="detail-row"><span className="detail-label">Gross Amount</span><span className="detail-value" style={{ fontWeight: 700, fontSize: 15 }}>{formatCurrency(invoice.grossAmount, invoice.currency)}</span></div>
                <div className="detail-row"><span className="detail-label">Net Amount</span><span className="detail-value">{formatCurrency(invoice.netAmount, invoice.currency)}</span></div>
                <div className="detail-row"><span className="detail-label">Tax Amount</span><span className="detail-value">{formatCurrency(invoice.taxAmount, invoice.currency)}</span></div>
                <div className="detail-row"><span className="detail-label">Payment Terms</span><span className="detail-value">{invoice.paymentTerms}</span></div>
                <div className="detail-row"><span className="detail-label">Status</span>
                  <span className={`badge ${invoice.status === 'Paid' ? 'badge-match' : invoice.status === 'Blocked' ? 'badge-mismatch' : 'badge-partial'}`}>{invoice.status}</span>
                </div>
                {invoice.paymentBlock && (
                  <div className="detail-row">
                    <span className="detail-label">Payment Block</span>
                    <span className="badge badge-mismatch">Code: {invoice.paymentBlock}</span>
                  </div>
                )}
                <div className="detail-row"><span className="detail-label">Company Code</span><span className="detail-value">{invoice.companyCode}</span></div>
              </div>
            ) : <div style={{ color: 'var(--text-muted)', padding: 16 }}>Invoice not found</div>}
          </div>

          {/* Section 4 – PO */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title"><FileText size={16} /> Purchase Order</span>
              {po && <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{po.id}</span>}
            </div>
            {po ? (
              <div className="detail-section">
                <div className="detail-row"><span className="detail-label">PO Number</span><span className="detail-value" style={{ fontFamily: 'monospace' }}>{po.id}</span></div>
                <div className="detail-row"><span className="detail-label">Document Date</span><span className="detail-value">{formatDate(po.documentDate)}</span></div>
                <div className="detail-row"><span className="detail-label">Delivery Date</span><span className="detail-value">{formatDate(po.deliveryDate)}</span></div>
                <div className="detail-row"><span className="detail-label">Company Code</span><span className="detail-value" style={{ color: po.companyCode !== exc.companyCode ? 'var(--color-error)' : 'var(--text-primary)' }}>{po.companyCode}{po.companyCode !== exc.companyCode && ' ⚠ MISMATCH'}</span></div>
                <div className="detail-row"><span className="detail-label">Total PO Value</span><span className="detail-value" style={{ fontWeight: 700 }}>{formatCurrency(po.totalAmount, po.currency)}</span></div>
                <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value">{po.status}</span></div>
                <div className="detail-row"><span className="detail-label">Created By</span><span className="detail-value">{MOCK_USERS.find(u => u.id === po.createdBy)?.name ?? po.createdBy}</span></div>
                <div className="detail-row"><span className="detail-label">Approved By</span><span className="detail-value">{MOCK_USERS.find(u => u.id === po.approvedBy)?.name ?? po.approvedBy}</span></div>
                <div style={{ marginTop: 12 }}>
                  <div className="detail-section-title"><Package size={13} /> Line Items</div>
                  {po.lineItems.map(line => (
                    <div key={line.lineNumber} style={{ background: 'var(--bg-surface)', borderRadius: 6, padding: '8px 12px', marginBottom: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Line {line.lineNumber} – {line.materialDescription}</div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                        <span>Qty: <strong>{line.quantity} {line.unit}</strong></span>
                        <span>Unit Price: <strong>{formatCurrency(line.unitPrice, line.currency)}</strong></span>
                        <span>Total: <strong>{formatCurrency(line.totalAmount, line.currency)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div style={{ color: 'var(--text-muted)', padding: 16 }}>PO not found</div>}
          </div>

          {/* Section 5 – GR */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title"><Truck size={16} /> Goods Receipt</span>
              {!gr && <span className="badge badge-gr-missing">No GR Found</span>}
            </div>
            {gr ? (
              <div className="detail-section">
                <div className="detail-row"><span className="detail-label">GR Document</span><span className="detail-value" style={{ fontFamily: 'monospace' }}>{gr.id}</span></div>
                <div className="detail-row"><span className="detail-label">Posting Date</span><span className="detail-value">{formatDate(gr.postingDate)}</span></div>
                <div className="detail-row"><span className="detail-label">Delivery Note</span><span className="detail-value" style={{ fontFamily: 'monospace' }}>{gr.deliveryNote}</span></div>
                <div className="detail-row"><span className="detail-label">Status</span><span className={`badge ${gr.status === 'Posted' ? 'badge-match' : 'badge-partial'}`}>{gr.status}</span></div>
                <div className="detail-row"><span className="detail-label">Received By</span><span className="detail-value">{MOCK_USERS.find(u => u.id === gr.receivedBy)?.name ?? gr.receivedBy}</span></div>
                <div style={{ marginTop: 12 }}>
                  <div className="detail-section-title"><Package size={13} /> Received Items</div>
                  {gr.lineItems.map(line => (
                    <div key={line.lineNumber} style={{ background: 'var(--bg-surface)', borderRadius: 6, padding: '8px 12px', marginBottom: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Line {line.lineNumber} – {line.materialDescription}</div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
                        <span>Received: <strong>{line.quantityReceived} {line.unit}</strong></span>
                        <span>Date: <strong>{formatDate(line.receiptDate)}</strong></span>
                        <span>Batch: <strong>{line.batchNumber}</strong></span>
                        <span>Quality: <strong style={{ color: line.qualityStatus === 'Passed' ? 'var(--color-success)' : 'var(--color-error)' }}>{line.qualityStatus}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                <Truck size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                <div>No Goods Receipt posted in SAP for this Purchase Order.</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Invoice cannot be cleared for payment until GR is confirmed.</div>
              </div>
            )}
          </div>

          {/* Section 6 – Three-Way Match */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title"><CheckCircle size={16} /> Three-Way Match Analysis</span>
              {matchResults.length > 0 && (
                <span className={`badge ${
                  matchResults.every(m => m.overallStatus === 'Matched') ? 'badge-match' :
                  matchResults.some(m => m.overallStatus === 'GR Missing') ? 'badge-gr-missing' :
                  matchResults.some(m => m.overallStatus === 'Mismatch') ? 'badge-mismatch' : 'badge-partial'
                }`}>
                  {matchResults.every(m => m.overallStatus === 'Matched') ? '✓ Fully Matched' :
                   matchResults.some(m => m.overallStatus === 'GR Missing') ? 'GR Missing' :
                   matchResults.some(m => m.overallStatus === 'Mismatch') ? '✗ Mismatch Detected' : '⚠ Partial Match'}
                </span>
              )}
            </div>

            {matchResults.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: 12 }}>No match data available.</div>
            ) : matchResults.map((match, idx) => (
              <div key={idx} style={{ marginBottom: idx < matchResults.length - 1 ? 16 : 0 }}>
                {matchResults.length > 1 && (
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Line {match.poLineItem.lineNumber} – {match.poLineItem.materialDescription}
                  </div>
                )}
                <div className="match-grid">
                  {/* PO */}
                  <div className="match-box match-box-po">
                    <div className="match-box-title"><FileText size={12} /> Purchase Order</div>
                    <div className="match-row"><span className="match-key">Qty</span><span className="match-val">{match.poLineItem.quantity} {match.poLineItem.unit}</span></div>
                    <div className="match-row"><span className="match-key">Unit Price</span><span className="match-val">{formatCurrency(match.poLineItem.unitPrice, po?.currency)}</span></div>
                    <div className="match-row"><span className="match-key">Total</span><span className="match-val">{formatCurrency(match.poLineItem.totalAmount, po?.currency)}</span></div>
                  </div>
                  {/* GR */}
                  <div className="match-box match-box-gr">
                    <div className="match-box-title"><Truck size={12} /> Goods Receipt</div>
                    {match.grLineItem ? (
                      <>
                        <div className="match-row"><span className="match-key">Qty Received</span><span className="match-val">{match.grLineItem.quantityReceived} {match.grLineItem.unit}</span></div>
                        <div className="match-row"><span className="match-key">Receipt Date</span><span className="match-val">{formatDate(match.grLineItem.receiptDate)}</span></div>
                        <div className="match-row"><span className="match-key">Quality</span><span className="match-val" style={{ color: match.grLineItem.qualityStatus === 'Passed' ? 'var(--color-success)' : 'var(--color-error)' }}>{match.grLineItem.qualityStatus}</span></div>
                      </>
                    ) : (
                      <div style={{ color: 'var(--color-error)', fontSize: 12, padding: '8px 0' }}>
                        ✗ No GR posted
                      </div>
                    )}
                  </div>
                  {/* Invoice */}
                  <div className="match-box match-box-inv">
                    <div className="match-box-title"><CreditCard size={12} /> Invoice</div>
                    <div className="match-row"><span className="match-key">Qty</span><span className="match-val">{match.invoiceLineItem.quantity} {match.invoiceLineItem.unit}</span></div>
                    <div className="match-row"><span className="match-key">Unit Price</span><span className="match-val">{formatCurrency(match.invoiceLineItem.unitPrice, invoice?.currency)}</span></div>
                    <div className="match-row"><span className="match-key">Total</span><span className="match-val">{formatCurrency(match.invoiceLineItem.totalAmount, invoice?.currency)}</span></div>
                    <div className="match-row"><span className="match-key">Tax Rate</span><span className="match-val">{match.invoiceLineItem.taxRate}%</span></div>
                  </div>
                </div>

                {/* Variance Results */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                  <div className={`match-variance ${match.overallStatus === 'GR Missing' ? 'missing' : !match.quantityMatch ? 'error' : 'ok'}`} style={{ flex: 1 }}>
                    {match.overallStatus === 'GR Missing' ? <AlertTriangle size={13} /> : match.quantityMatch ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 11 }}>Quantity</div>
                      {match.overallStatus === 'GR Missing'
                        ? <div style={{ fontSize: 11 }}>GR missing – cannot verify</div>
                        : !match.quantityMatch
                        ? <div style={{ fontSize: 11 }}>Variance: {match.quantityVariance > 0 ? '+' : ''}{match.quantityVariance} units ({match.quantityVariancePct.toFixed(1)}%)</div>
                        : <div style={{ fontSize: 11 }}>Matched ✓</div>}
                    </div>
                  </div>
                  <div className={`match-variance ${!match.priceMatch ? 'error' : 'ok'}`} style={{ flex: 1 }}>
                    {match.priceMatch ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 11 }}>Price</div>
                      {!match.priceMatch
                        ? <div style={{ fontSize: 11 }}>Variance: {match.priceVariance > 0 ? '+' : ''}{formatCurrency(Math.abs(match.priceVariance), invoice?.currency)} ({match.priceVariancePct.toFixed(1)}%)</div>
                        : <div style={{ fontSize: 11 }}>Matched ✓</div>}
                    </div>
                  </div>
                  <div className={`match-variance ${!match.amountMatch ? 'error' : 'ok'}`} style={{ flex: 1 }}>
                    {match.amountMatch ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 11 }}>Amount</div>
                      {!match.amountMatch
                        ? <div style={{ fontSize: 11 }}>Variance: {match.amountVariance > 0 ? '+' : ''}{formatCurrency(Math.abs(match.amountVariance), invoice?.currency)} ({match.amountVariancePct.toFixed(1)}%)</div>
                        : <div style={{ fontSize: 11 }}>Matched ✓</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 7 – Recommended Action */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title"><Zap size={16} /> Recommended Action</span>
            </div>
            <div style={{
              background: 'rgba(37,99,235,0.06)',
              border: '1px solid rgba(37,99,235,0.15)',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}>
              {exc.recommendedAction}
            </div>
          </div>

          {/* Section 8 – AI Assistant */}
          <div className="ai-panel" style={{ marginBottom: 16 }}>
            <div className="ai-panel-header">
              <Brain size={18} color="#818cf8" />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>AI Exception Assistant</span>
              <span className="ai-badge">MOCK AI</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>Deterministic · Grounded in exception data</span>
            </div>

            {exc.aiRecommendationStatus && exc.aiRecommendationStatus !== 'Pending' && (
              <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: exc.aiRecommendationStatus === 'Accepted' ? 'rgba(34,197,94,0.08)' : exc.aiRecommendationStatus === 'Rejected' ? 'rgba(239,68,68,0.08)' : 'rgba(234,179,8,0.08)',
                color: exc.aiRecommendationStatus === 'Accepted' ? '#4ade80' : exc.aiRecommendationStatus === 'Rejected' ? '#f87171' : '#facc15',
              }}>
                AI Recommendation: {exc.aiRecommendationStatus}
              </div>
            )}

            {aiStatus === 'idle' && (
              <button id="ai-generate-btn" className="btn btn-secondary" onClick={loadAI} disabled={aiLoading}>
                {aiLoading ? <><span className="spinner" /> Generating insight…</> : <><Brain size={13} /> Generate AI Insight</>}
              </button>
            )}

            {aiInsight && (
              <>
                <div className="ai-section">
                  <div className="ai-section-label">Summary</div>
                  <div className="ai-text">{aiInsight.summary}</div>
                </div>
                <div className="ai-section">
                  <div className="ai-section-label">Why did this exception occur?</div>
                  <div className="ai-text">{aiInsight.explanation}</div>
                </div>
                <div className="ai-section">
                  <div className="ai-section-label">Recommended Next Action</div>
                  <div className="ai-text" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{aiInsight.recommendation}</div>
                </div>
                <div className="ai-section">
                  <div className="ai-section-label">Evidence Used</div>
                  <ul className="ai-evidence-list">
                    {aiInsight.evidence.map((ev, i) => (
                      <li key={i} className="ai-evidence-item">
                        <Shield size={10} style={{ flexShrink: 0, marginTop: 1, color: '#818cf8' }} />
                        {ev}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ai-confidence">
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${aiInsight.confidence}%`, height: '100%', background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8' }}>{aiInsight.confidence}%</span>
                </div>
                <div className="ai-actions">
                  <button id="ai-accept-btn" className="btn btn-success btn-sm" onClick={() => handleAIAction('accept')}>
                    <ThumbsUp size={12} /> Accept Recommendation
                  </button>
                  <button id="ai-edit-btn" className="btn btn-secondary btn-sm" onClick={() => handleAIAction('edit')}>
                    <Edit3 size={12} /> Edit
                  </button>
                  <button id="ai-reject-btn" className="btn btn-danger btn-sm" onClick={() => handleAIAction('reject')}>
                    <ThumbsDown size={12} /> Reject
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Section 9 – Comments */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title"><MessageSquare size={16} /> Comments ({comments.length})</span>
            </div>
            <div className="comment-thread">
              {comments.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '8px 0' }}>No comments yet. Add the first comment below.</div>
              )}
              {comments.map((c) => {
                const u = MOCK_USERS.find(u => u.id === c.userId);
                return (
                  <div key={c.id} className="comment-item">
                    <div className="avatar">{u?.avatar ?? '??'}</div>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <span className="comment-author">{u?.name ?? 'Unknown'}</span>
                        <span style={{ fontSize: 10, background: 'var(--bg-app)', borderRadius: 4, padding: '1px 6px', color: 'var(--text-muted)' }}>{u?.role}</span>
                        <span className="comment-time">{formatDateTime(c.timestamp)}</span>
                      </div>
                      <div className="comment-text">{c.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Comment */}
            <div className="comment-form" style={{ marginTop: 16 }}>
              <div className="avatar">{currentUser?.avatar}</div>
              <div style={{ flex: 1 }}>
                <textarea
                  ref={commentRef}
                  id="comment-input"
                  className="form-textarea"
                  placeholder="Add a comment… (max 1000 characters)"
                  value={commentText}
                  onChange={(e) => { setCommentText(e.target.value); setCommentError(''); }}
                  rows={3}
                  maxLength={1000}
                />
                {commentError && <div className="form-error">{commentError}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{commentText.length}/1000</span>
                  <button id="comment-submit-btn" className="btn btn-primary btn-sm" onClick={handleComment}>
                    <Send size={12} /> Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 10 – Audit Trail */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><History size={16} /> Audit Trail ({auditEntries.length})</span>
            </div>
            <div className="audit-timeline">
              {auditEntries.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No audit entries.</div>
              )}
              {auditEntries.map((entry) => {
                const u = MOCK_USERS.find(u => u.id === entry.userId);
                const actionColors: Record<string, string> = {
                  Created: '#2563eb', Resolved: '#22c55e', Rejected: '#ef4444',
                  Assigned: '#f59e0b', Approved: '#22c55e', 'Status Changed': '#8b5cf6',
                  'Comment Added': '#06b6d4',
                };
                return (
                  <div key={entry.id} className="audit-entry">
                    <div className="audit-dot" style={{ borderColor: actionColors[entry.action] ?? 'var(--border-normal)', background: actionColors[entry.action] ? `${actionColors[entry.action]}18` : 'var(--bg-surface)' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: actionColors[entry.action] ?? 'var(--text-muted)' }} />
                    </div>
                    <div className="audit-content">
                      <div className="audit-action">{entry.action}</div>
                      <div className="audit-desc">{entry.description}</div>
                      {entry.previousValue && entry.newValue && (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                          <span style={{ color: '#f87171' }}>{entry.previousValue}</span>
                          {' → '}
                          <span style={{ color: '#4ade80' }}>{entry.newValue}</span>
                        </div>
                      )}
                      <div className="audit-meta">
                        <span className="audit-user">{u?.name ?? entry.userId}</span>
                        <span className="audit-time">{formatDateTime(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Risk Score */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Shield size={16} /> Risk Score</span>
            </div>
            <div className="risk-gauge-wrapper">
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-surface)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={riskScoreColor(exc.riskScore)}
                    strokeWidth="10"
                    strokeDasharray={`${(exc.riskScore / 100) * 314} 314`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                </svg>
                <div className="risk-score-label">
                  <span className="risk-score-number" style={{ color: riskScoreColor(exc.riskScore) }}>{exc.riskScore}</span>
                  <span className="risk-score-sub">{exc.riskLevel}</span>
                </div>
              </div>

              <div className="risk-breakdown">
                {Object.entries(riskBreakdown).map(([label, score]) => {
                  const max = parseInt(label.match(/max (\d+)/)?.[1] ?? '35');
                  return (
                    <div key={label} className="risk-bar-row">
                      <span className="risk-bar-label">{label}</span>
                      <div className="risk-bar-track">
                        <div className="risk-bar-fill" style={{ width: `${(score / max) * 100}%` }} />
                      </div>
                      <span className="risk-bar-val">{score}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Financial Exposure */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><CreditCard size={16} /> Financial Exposure</span>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: exc.financialExposure > 0 ? riskScoreColor(exc.riskScore) : 'var(--color-success)' }}>
                {formatCurrency(exc.financialExposure, exc.currency)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Unresolved financial exposure</div>
            </div>
            <div className="detail-section" style={{ marginTop: 12 }}>
              <div className="detail-row"><span className="detail-label">Ageing</span><span className="detail-value" style={{ color: exc.ageingDays > 30 ? 'var(--color-error)' : 'var(--text-primary)' }}>{exc.ageingDays} days ({exc.ageingBucket})</span></div>
              <div className="detail-row"><span className="detail-label">Priority</span><span className={`badge badge-priority-${exc.priority.toLowerCase()}`}>{exc.priority}</span></div>
              <div className="detail-row"><span className="detail-label">SLA Status</span><span className={`badge ${exc.slaBreached ? 'badge-mismatch' : 'badge-match'}`}>{exc.slaBreached ? 'Breached' : 'Within SLA'}</span></div>
            </div>
          </div>

          {/* Assignment */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><User size={16} /> Assignment</span>
            </div>
            {owner ? (
              <div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div className="avatar avatar-lg">{owner.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{owner.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{owner.role}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{owner.department}</div>
                  </div>
                </div>
                {exc.assignedDate && (
                  <div className="detail-row"><span className="detail-label">Assigned On</span><span className="detail-value">{formatDate(exc.assignedDate)}</span></div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '8px 0' }}>
                Not yet assigned. Click "Assign" to allocate an owner.
              </div>
            )}
            <button className="btn btn-secondary btn-sm w-full" style={{ marginTop: 12 }} onClick={() => setShowAssignModal(true)}>
              <User size={12} /> {owner ? 'Reassign' : 'Assign Owner'}
            </button>
          </div>

          {/* Resolution History */}
          {exc.resolutionNote && (
            <div className="card">
              <div className="card-header">
                <span className="card-title"><CheckCircle size={16} /> Resolution</span>
              </div>
              <div className="detail-section">
                {exc.resolutionCategory && <div className="detail-row"><span className="detail-label">Category</span><span className="detail-value">{exc.resolutionCategory}</span></div>}
                {exc.resolvedDate && <div className="detail-row"><span className="detail-label">Resolved On</span><span className="detail-value">{formatDate(exc.resolvedDate)}</span></div>}
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 8, padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 6 }}>
                  {exc.resolutionNote}
                </div>
              </div>
            </div>
          )}

          {/* Workflow Actions */}
          {transitions.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title"><RefreshCw size={16} /> Workflow Actions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {transitions.map((t) => (
                  <button
                    key={t.to}
                    id={`workflow-${t.to.replace(/ /g, '-').toLowerCase()}`}
                    className={`btn btn-sm w-full ${t.to === 'Resolved' ? 'btn-success' : t.to === 'Rejected' ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => { setSelectedTransitionTo(t.to); setShowWorkflowModal(true); }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Modal */}
      {showWorkflowModal && (
        <div className="modal-overlay" onClick={() => setShowWorkflowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Change Status</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowWorkflowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Transition</label>
                <select
                  id="status-transition-select"
                  className="form-select"
                  value={selectedTransitionTo}
                  onChange={(e) => setSelectedTransitionTo(e.target.value)}
                >
                  <option value="">— Select action —</option>
                  {transitions.map((t) => (
                    <option key={t.to} value={t.to}>{t.label} → {t.to}</option>
                  ))}
                </select>
              </div>
              {selectedTransitionTo && (
                <div className="form-group">
                  <label className="form-label">
                    Resolution Note {transitions.find(t => t.to === selectedTransitionTo)?.requiresNote ? '(Required)' : '(Optional)'}
                  </label>
                  <textarea
                    id="workflow-note"
                    className="form-textarea"
                    placeholder="Explain the reason for this status change…"
                    value={workflowNote}
                    onChange={(e) => setWorkflowNote(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowWorkflowModal(false)}>Cancel</button>
              <button
                id="workflow-confirm-btn"
                className="btn btn-primary"
                onClick={handleStatusChange}
                disabled={!selectedTransitionTo || (transitions.find(t => t.to === selectedTransitionTo)?.requiresNote && !workflowNote.trim())}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Assign Exception</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Owner</label>
                <select
                  id="assign-owner-select"
                  className="form-select"
                  value={selectedOwnerId}
                  onChange={(e) => setSelectedOwnerId(e.target.value)}
                >
                  <option value="">— Select user —</option>
                  {MOCK_USERS.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              {selectedOwnerId && (
                <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="avatar">{MOCK_USERS.find(u => u.id === selectedOwnerId)?.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{MOCK_USERS.find(u => u.id === selectedOwnerId)?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{MOCK_USERS.find(u => u.id === selectedOwnerId)?.role}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button
                id="assign-confirm-btn"
                className="btn btn-primary"
                onClick={handleAssign}
                disabled={!selectedOwnerId}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
