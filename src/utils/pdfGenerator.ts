import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Member, Collection } from '../db/database';
import { format, parseISO } from 'date-fns';

export async function generateMonthlyBillPDF(
  member: Member,
  monthStr: string,
  collections: Collection[]
) {
  // Parse month string e.g. "2026-06" to a displayable name
  const monthDate = parseISO(`${monthStr}-01`);
  const billingMonth = format(monthDate, 'MMMM yyyy');

  // Compute metrics
  const totalLitres = collections.reduce((sum, c) => sum + c.quantity_litres, 0);
  const avgFat = collections.length
    ? collections.reduce((sum, c) => sum + c.fat_percent, 0) / collections.length
    : 0;
  const totalAmount = collections.reduce((sum, c) => sum + c.amount_due, 0);
  
  const advanceAdjustment = member.advance_balance || 0;
  const netPayable = Math.max(0, totalAmount - advanceAdjustment);

  // Generate table rows HTML
  const rowsHtml = collections
    .map((c) => {
      const formattedDate = format(parseISO(c.collection_date), 'dd-MM-yyyy');
      return `
        <tr>
          <td>${formattedDate}</td>
          <td>${c.session}</td>
          <td>${c.quantity_litres.toFixed(1)} L</td>
          <td>${c.fat_percent.toFixed(1)}%</td>
          <td>₹${c.rate_per_litre.toFixed(1)}</td>
          <td style="font-weight: 600; text-align: right;">₹${c.amount_due.toFixed(2)}</td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Monthly Milk Bill</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1A1A16;
          background-color: #FFFFFF;
          margin: 0;
          padding: 30px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #1A6B3C;
          padding-bottom: 15px;
          margin-bottom: 30px;
        }
        .header-title-container {
          flex: 1;
        }
        .header-title {
          font-size: 24px;
          font-weight: 800;
          color: #1A6B3C;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header-subtitle {
          font-size: 13px;
          color: #6B6860;
          margin: 5px 0 0 0;
        }
        .logo {
          font-size: 32px;
          margin: 0;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          background-color: #F7F6F2;
          padding: 15px 20px;
          border-radius: 8px;
          border: 1px solid #E2DED7;
        }
        .info-block {
          flex: 1;
        }
        .info-block:last-child {
          text-align: right;
        }
        .info-label {
          font-size: 11px;
          color: #9E9B94;
          text-transform: uppercase;
          margin-bottom: 4px;
          font-weight: 700;
          letter-spacing: 0.8px;
        }
        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #1A1A16;
          line-height: 1.4;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background-color: #1A6B3C;
          color: #FFFFFF;
          text-align: left;
          padding: 12px 10px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        th:last-child {
          text-align: right;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #E2DED7;
          font-size: 13px;
          color: #1A1A16;
        }
        tr:nth-child(even) {
          background-color: #FAF9F6;
        }
        .summary-wrapper {
          display: flex;
          justify-content: flex-end;
        }
        .summary-table {
          width: 320px;
          border: 1px solid #E2DED7;
          border-radius: 8px;
          overflow: hidden;
          border-collapse: collapse;
        }
        .summary-table td {
          padding: 10px 15px;
          font-size: 13px;
          border-bottom: 1px solid #E2DED7;
        }
        .summary-table td:last-child {
          text-align: right;
          font-weight: 600;
        }
        .summary-table tr:last-child td {
          border-bottom: none;
          background-color: #E8F5EE;
          font-weight: 800;
          color: #1A6B3C;
          font-size: 16px;
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          font-size: 11px;
          color: #9E9B94;
          border-top: 1px solid #E2DED7;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-title-container">
          <h1 class="header-title">Milk Supplier Statement</h1>
          <p class="header-subtitle">Generated on ${format(new Date(), 'dd-MM-yyyy HH:mm')}</p>
        </div>
        <div class="logo">🐄</div>
      </div>

      <div class="info-section">
        <div class="info-block">
          <div class="info-label">Supplier Information</div>
          <div class="info-value">
            <strong>${member.name}</strong><br>
            ${member.village ? `Village: ${member.village}<br>` : ''}
            ${member.phone ? `Phone: ${member.phone}` : ''}
          </div>
        </div>
        <div class="info-block">
          <div class="info-label">Billing Period</div>
          <div class="info-value" style="font-size: 16px; font-weight: 700; color: #1A6B3C;">
            ${billingMonth}
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Session</th>
            <th>Qty (Litres)</th>
            <th>Fat %</th>
            <th>Rate/L</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || `<tr><td colspan="6" style="text-align: center; color: #9E9B94;">No milk collection data recorded for this month.</td></tr>`}
        </tbody>
      </table>

      ${collections.length ? `
      <div class="summary-wrapper">
        <table class="summary-table">
          <tbody>
            <tr>
              <td>Total Quantity</td>
              <td>${totalLitres.toFixed(1)} L</td>
            </tr>
            <tr>
              <td>Average Fat</td>
              <td>${avgFat.toFixed(2)}%</td>
            </tr>
            <tr>
              <td>Gross Amount</td>
              <td>₹${totalAmount.toFixed(2)}</td>
            </tr>
            ${advanceAdjustment > 0 ? `
            <tr>
              <td>Advance Deducted</td>
              <td style="color: #D94040;">- ₹${advanceAdjustment.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td>Net Payout</td>
              <td>₹${netPayable.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="footer">
        Thank you for your valuable partnership. For billing inquiries, please contact the manager.<br>
        <strong>Generated via Dairy Manager App</strong>
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    // Safely name the file for sharing, e.g., "Ramesh_Kumar_June_2026_Bill.pdf"
    const safeName = member.name.replace(/[^a-zA-Z0-9]/g, '_');
    const safeMonth = billingMonth.replace(/[^a-zA-Z0-9]/g, '_');
    const newPath = uri.substring(0, uri.lastIndexOf('/')) + `/${safeName}_${safeMonth}_Bill.pdf`;

    // Try to move it to a human-friendly name if sharing allows it (usually Expo sharing passes the name properly)
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${member.name} - ${billingMonth} Bill`,
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    console.error('Error generating PDF bill:', error);
    throw error;
  }
}

export async function printCollectionReceipt(
  member: Member,
  date: string,
  session: 'AM' | 'PM',
  quantity: number,
  fat: number,
  rate: number,
  amount: number
) {
  const formattedDate = format(parseISO(date), 'dd-MM-yyyy');
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          color: #000;
          padding: 10px;
          width: 280px; /* Standard 58mm thermal paper width */
          margin: 0 auto;
          font-size: 14px;
        }
        .text-center { text-align: center; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; }
        .bold { font-weight: bold; }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 2px; }
        .footer { font-size: 11px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="text-center">
        <span class="title">🐄 DAIRY MANAGER</span><br>
        <span>MILK COLLECTION RECEIPT</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="row"><span class="bold">Date:</span><span>${formattedDate} (${session})</span></div>
      <div class="row"><span class="bold">Member:</span><span>${member.name}</span></div>
      ${member.phone ? `<div class="row"><span class="bold">Phone:</span><span>${member.phone}</span></div>` : ''}
      
      <div class="divider"></div>
      
      <div class="row"><span class="bold">Quantity:</span><span>${quantity.toFixed(1)} L</span></div>
      <div class="row"><span class="bold">Fat %:</span><span>${fat.toFixed(1)}%</span></div>
      <div class="row"><span class="bold">Rate:</span><span>₹${rate.toFixed(1)}/L</span></div>
      
      <div class="divider"></div>
      
      <div class="row bold" style="font-size: 16px;">
        <span>TOTAL DUE:</span>
        <span>₹${amount.toFixed(2)}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="text-center footer">
        Thank you for supplying milk!<br>
        Generated via Dairy Manager App
      </div>
    </body>
    </html>
  `;

  try {
    await Print.printAsync({ html: htmlContent });
  } catch (error) {
    console.error('Error printing receipt:', error);
    throw error;
  }
}

export async function shareCollectionReceipt(
  member: Member,
  date: string,
  session: 'AM' | 'PM',
  quantity: number,
  fat: number,
  rate: number,
  amount: number
) {
  const formattedDate = format(parseISO(date), 'dd-MM-yyyy');
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1A1A16;
          padding: 20px;
          max-width: 400px;
          margin: 0 auto;
          background-color: #FAF9F6;
          border: 1px solid #E2DED7;
          border-radius: 12px;
        }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1A6B3C; padding-bottom: 10px; margin-bottom: 15px; }
        .title { font-size: 18px; font-weight: bold; color: #1A6B3C; }
        .row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 14px; }
        .divider { border-top: 1px dashed #E2DED7; margin: 10px 0; }
        .total-box { background-color: #E8F5EE; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .total-label { font-weight: bold; color: #1A6B3C; font-size: 15px; }
        .total-val { font-size: 18px; font-weight: 800; color: #1A6B3C; }
        .footer { text-align: center; font-size: 11px; color: #9E9B94; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="title">🐄 Dairy Manager</span>
        <span style="font-size: 20px;">📄</span>
      </div>
      <div class="row"><strong>Date:</strong><span>${formattedDate} (${session})</span></div>
      <div class="row"><strong>Member:</strong><span>${member.name}</span></div>
      
      <div class="divider"></div>
      
      <div class="row"><span>Quantity:</span><span>${quantity.toFixed(1)} L</span></div>
      <div class="row"><span>Fat %:</span><span>${fat.toFixed(1)}%</span></div>
      <div class="row"><span>Rate:</span><span>₹${rate.toFixed(1)}/L</span></div>
      
      <div class="divider"></div>
      
      <div class="total-box">
        <span class="total-label">Total Amount:</span>
        <span class="total-val">₹${amount.toFixed(2)}</span>
      </div>
      
      <div class="footer">
        Thank you for your partnership!
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Receipt - ${member.name} - ${formattedDate}`,
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    console.error('Error sharing receipt:', error);
    throw error;
  }
}
