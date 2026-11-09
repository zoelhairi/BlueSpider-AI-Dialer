/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import type { CallLog, CallAnalytics } from '../types/index.ts';

// -----------------------------------------------------------------------------
// CSV EXPORT ENGINE
// -----------------------------------------------------------------------------
export function exportCallsToCSV(calls: CallLog[], filenamePrefix = 'vapi_call_logs'): void {
  if (!calls.length) {
    alert('No call records available to export.');
    return;
  }

  const headers = [
    'Call ID',
    'Vapi Call ID',
    'Date & Time',
    'Campaign Name',
    'Assistant Name',
    'Customer Name',
    'Customer Phone',
    'Caller Line',
    'Call Type',
    'Status',
    'Duration (sec)',
    'Duration (mm:ss)',
    'Total Cost (USD)',
    'End Reason',
    'User Sentiment',
    'Summary',
    'TTFT (ms)',
    'LLM Latency (ms)',
    'TTS Latency (ms)',
  ];

  const escapeCSV = (value: any) => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = calls.map((c) => {
    const minutes = Math.floor((c.durationSeconds || 0) / 60);
    const seconds = (c.durationSeconds || 0) % 60;
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return [
      escapeCSV(c.id),
      escapeCSV(c.vapiCallId),
      escapeCSV(new Date(c.startedAt).toLocaleString()),
      escapeCSV(c.campaignName || 'Direct / Ad-hoc'),
      escapeCSV(c.assistantName),
      escapeCSV(c.customerName || 'N/A'),
      escapeCSV(c.customerPhone),
      escapeCSV(c.phoneNumber),
      escapeCSV(c.type),
      escapeCSV(c.status),
      escapeCSV(c.durationSeconds),
      escapeCSV(formattedDuration),
      escapeCSV(`$${(c.cost || 0).toFixed(4)}`),
      escapeCSV(c.endReason || 'N/A'),
      escapeCSV(c.analysis?.userSentiment || 'neutral'),
      escapeCSV(c.analysis?.summary || ''),
      escapeCSV(c.latencyMetrics?.ttftMs || 0),
      escapeCSV(c.latencyMetrics?.llmLatencyMs || 0),
      escapeCSV(c.latencyMetrics?.ttsLatencyMs || 0),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// -----------------------------------------------------------------------------
// PDF REPORT GENERATOR (Executive Summary & Detailed Telemetry)
// -----------------------------------------------------------------------------
export function exportCallsToPDF(
  calls: CallLog[],
  analytics?: CallAnalytics,
  reportTitle = 'BlueSpider AI Dialer Performance Report'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 18;

  // Header Bar (Dark slate background strip)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, yPos, contentWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('BLUESPIDER AI DIALER', margin + 6, yPos + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`${reportTitle.toUpperCase()} · GENERATED: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin + 6, yPos + 16);

  yPos += 28;

  // Executive KPI Summary Grid (4 metric cards in row)
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Executive Summary & Aggregate Metrics', margin, yPos);
  yPos += 5;

  const totalCalls = calls.length;
  const totalCost = calls.reduce((acc, c) => acc + (c.cost || 0), 0);
  const totalDuration = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const avgDuration = totalCalls ? Math.round(totalDuration / totalCalls) : 0;
  const positiveSentimentCount = calls.filter((c) => c.analysis?.userSentiment === 'positive').length;
  const sentimentRate = totalCalls ? Math.round((positiveSentimentCount / totalCalls) * 100) : 0;

  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 16;

  const kpis = [
    { label: 'Total Calls Processed', value: `${totalCalls}` },
    { label: 'Avg Call Duration', value: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s` },
    { label: 'Total Telephony Cost', value: `$${totalCost.toFixed(2)}` },
    { label: 'Positive CSAT / Sentiment', value: `${sentimentRate}%` },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(kpi.label, cardX + 3, yPos + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(kpi.value, cardX + 3, yPos + 12);
  });

  yPos += cardHeight + 8;

  // Telephony Outcomes & Distribution
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Call Outcomes & Sentiment Distribution', margin, yPos);
  yPos += 5;

  const outcomeCounts: Record<string, number> = {};
  calls.forEach((c) => {
    const reason = c.endReason || 'other';
    outcomeCounts[reason] = (outcomeCounts[reason] || 0) + 1;
  });

  const outcomeText = Object.entries(outcomeCounts)
    .map(([k, v]) => `${k}: ${v} (${Math.round((v / totalCalls) * 100)}%)`)
    .join('  ·  ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(outcomeText || 'All calls nominal', margin, yPos);
  yPos += 8;

  // Call Logs Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Call Detail Telemetry Log (Showing ${Math.min(calls.length, 25)} records)`, margin, yPos);
  yPos += 4;

  // Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, yPos, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, yPos + 7, margin + contentWidth, yPos + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);

  const colX = {
    vapiId: margin + 2,
    customer: margin + 30,
    assistant: margin + 68,
    campaign: margin + 104,
    status: margin + 134,
    duration: margin + 150,
    cost: margin + 164,
  };

  doc.text('CALL ID', colX.vapiId, yPos + 4.8);
  doc.text('CUSTOMER / PHONE', colX.customer, yPos + 4.8);
  doc.text('ASSISTANT', colX.assistant, yPos + 4.8);
  doc.text('CAMPAIGN', colX.campaign, yPos + 4.8);
  doc.text('STATUS', colX.status, yPos + 4.8);
  doc.text('DURATION', colX.duration, yPos + 4.8);
  doc.text('COST', colX.cost, yPos + 4.8);

  yPos += 7;

  // Table Rows (up to 25 items to fit nicely)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);

  const sampleCalls = calls.slice(0, 25);
  sampleCalls.forEach((call, index) => {
    // Check if new page needed
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPos, contentWidth, 6.5, 'F');
    }

    doc.setTextColor(71, 85, 105);

    const callIdShort = call.vapiCallId.substring(0, 12);
    const customerInfo = `${call.customerName || 'Prospect'} (${call.customerPhone.slice(-9)})`;
    const asstShort = call.assistantName.substring(0, 20);
    const campShort = (call.campaignName || 'Direct').substring(0, 16);
    const mins = Math.floor(call.durationSeconds / 60);
    const secs = call.durationSeconds % 60;
    const durStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    const costStr = `$${(call.cost || 0).toFixed(3)}`;

    doc.text(callIdShort, colX.vapiId, yPos + 4.5);
    doc.text(customerInfo, colX.customer, yPos + 4.5);
    doc.text(asstShort, colX.assistant, yPos + 4.5);
    doc.text(campShort, colX.campaign, yPos + 4.5);
    doc.text(call.status, colX.status, yPos + 4.5);
    doc.text(durStr, colX.duration, yPos + 4.5);
    doc.text(costStr, colX.cost, yPos + 4.5);

    yPos += 6.5;
  });

  // Footer on bottom
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'BlueSpider AI Dialer · Confidential · Exported with Supabase & Docker synchronization engine',
    margin,
    288
  );

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`BlueSpider_Call_Performance_Report_${dateStr}.pdf`);
}
