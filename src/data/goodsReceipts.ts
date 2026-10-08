// ============================================================
// Mock Data – Goods Receipts
// SAP MIGO / MM-WM shape
// In production: SAP OData /sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV
// ============================================================

import { GoodsReceipt } from '../types';

export const MOCK_GOODS_RECEIPTS: GoodsReceipt[] = [
  {
    id: 'GR-5000001',
    poId: 'PO-4500001',
    supplierId: 'BP-10001',
    companyCode: '1000',
    plant: '1107',
    postingDate: '2026-09-08',
    deliveryNote: 'DN-GU-2026-0089',
    status: 'Partial',               // Only 20 of 25 received
    lineItems: [
      {
        lineNumber: 10,
        material: 'SD-480',
        materialDescription: 'Servo Drive SD-480',
        quantityReceived: 20,        // PO qty = 25 → mismatch
        unit: 'EA',
        receiptDate: '2026-09-08',
        batchNumber: 'BATCH-2026-0441',
        storageLocation: 'SL14',
        qualityStatus: 'Passed',
      },
    ],
    receivedBy: 'USR-002',
  },
  {
    id: 'GR-5000002',
    poId: 'PO-4500002',
    supplierId: 'BP-10002',
    companyCode: '1000',
    plant: '1107',
    postingDate: '2026-08-18',
    deliveryNote: 'DN-AP-2026-0210',
    status: 'Posted',
    lineItems: [
      {
        lineNumber: 10,
        material: 'HYD-PUMP-3',
        materialDescription: 'Hydraulic Pump HYD-3',
        quantityReceived: 50,
        unit: 'EA',
        receiptDate: '2026-08-18',
        batchNumber: 'BATCH-2026-0512',
        storageLocation: 'SL14',
        qualityStatus: 'Passed',
      },
      {
        lineNumber: 20,
        material: 'CTRL-UNIT-7',
        materialDescription: 'Control Unit MK7',
        quantityReceived: 35,
        unit: 'EA',
        receiptDate: '2026-08-18',
        batchNumber: 'BATCH-2026-0513',
        storageLocation: 'SL22',
        qualityStatus: 'Passed',
      },
    ],
    receivedBy: 'USR-002',
  },
  // No GR for PO-4500003 (Nordic Freight) – missing GR exception
  {
    id: 'GR-5000003',
    poId: 'PO-4500004',
    supplierId: 'BP-10004',
    companyCode: '1000',
    plant: '1107',
    postingDate: '2026-09-28',
    deliveryNote: 'DN-MER-2026-0388',
    status: 'Posted',
    lineItems: [
      {
        lineNumber: 10,
        material: 'BEAR-SKF-6205',
        materialDescription: 'SKF Bearing 6205',
        quantityReceived: 200,
        unit: 'EA',
        receiptDate: '2026-09-28',
        batchNumber: 'BATCH-2026-0601',
        storageLocation: 'SL14',
        qualityStatus: 'Passed',
      },
      {
        lineNumber: 20,
        material: 'SEAL-NBR-40',
        materialDescription: 'NBR Seal 40mm',
        quantityReceived: 500,
        unit: 'EA',
        receiptDate: '2026-09-28',
        batchNumber: 'BATCH-2026-0602',
        storageLocation: 'SL14',
        qualityStatus: 'Passed',
      },
    ],
    receivedBy: 'USR-005',
  },
  {
    id: 'GR-5000004',
    poId: 'PO-4500005',
    supplierId: 'BP-10005',
    companyCode: '1000',   // GR posted under 1000 but invoice under 2000
    plant: '1107',
    postingDate: '2026-09-03',
    deliveryNote: 'DN-CE-2026-0145',
    status: 'Posted',
    lineItems: [
      {
        lineNumber: 10,
        material: 'PCB-MAIN-V3',
        materialDescription: 'Main PCB Board V3',
        quantityReceived: 120,
        unit: 'EA',
        receiptDate: '2026-09-03',
        batchNumber: 'BATCH-2026-0700',
        storageLocation: 'SL33',
        qualityStatus: 'Passed',
      },
    ],
    receivedBy: 'USR-002',
  },
  {
    id: 'GR-5000005',
    poId: 'PO-4500006',
    supplierId: 'BP-10006',
    companyCode: '1000',
    plant: '1107',
    postingDate: '2026-07-30',
    deliveryNote: 'DN-DP-2026-0321',
    status: 'Posted',
    lineItems: [
      {
        lineNumber: 10,
        material: 'PACK-PALLET-A',
        materialDescription: 'Standard Pallet Type A',
        quantityReceived: 600,
        unit: 'EA',
        receiptDate: '2026-07-30',
        batchNumber: 'BATCH-2026-0800',
        storageLocation: 'SL05',
        qualityStatus: 'Passed',
      },
    ],
    receivedBy: 'USR-005',
  },
];
