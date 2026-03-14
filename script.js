// Add/Remove rows and auto-calculate totals
function updateAmounts() {
  const rows = document.querySelectorAll('#items-body tr');
  let subtotal = 0;
  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('input[name="qty[]"]').value) || 0;
    const rate = parseFloat(row.querySelector('input[name="rate[]"]').value) || 0;
    const amount = qty * rate;
    row.querySelector('input[name="amount[]"]').value = amount.toFixed(2);
    subtotal += amount;
  });
  document.getElementById('subtotal').value = subtotal.toFixed(2);
  const gstRate = parseFloat(document.getElementById('gstRate').value) || 0;
  const cgst = subtotal * (gstRate / 100);
  const sgst = subtotal * (gstRate / 100);
  document.getElementById('cgst').value = cgst.toFixed(2);
  document.getElementById('sgst').value = sgst.toFixed(2);
  document.getElementById('total').value = (subtotal + cgst + sgst).toFixed(2);
}

document.getElementById('add-row').addEventListener('click', function () {
  const tbody = document.getElementById('items-body');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" name="desc[]" /></td>
    <td><input type="text" name="hsn[]" /></td>
    <td><input type="number" name="qty[]" value="1" min="1" /></td>
    <td><input type="number" name="rate[]" value="0" min="0" /></td>
    <td><input type="number" name="amount[]" value="0" readonly /></td>
    <td><button type="button" class="remove-row">Remove</button></td>
  `;
  tbody.appendChild(tr);
  tr.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updateAmounts);
  });
  tr.querySelector('.remove-row').addEventListener('click', function () {
    tr.remove();
    updateAmounts();
  });
});

document.querySelectorAll('input[name="qty[]"], input[name="rate[]"]').forEach(input => {
  input.addEventListener('input', updateAmounts);
});
document.getElementById('gstRate').addEventListener('change', updateAmounts);

document.querySelectorAll('.remove-row').forEach(btn => {
  btn.addEventListener('click', function () {
    btn.closest('tr').remove();
    updateAmounts();
  });
});

// Initialize Signature Pad
const canvas = document.getElementById('signature-pad');
const signaturePad = new SignaturePad(canvas);

document.getElementById('clear-signature').addEventListener('click', () => {
  signaturePad.clear();
});

document.getElementById('invoice-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const formData = new FormData(this);

  // QR Code Generation
  const qrContainer = document.getElementById('qrcode-container');
  qrContainer.innerHTML = '';
  const websiteUrl = formData.get('compWebsite') || 'https://www.bodybannao.com';

  // Generate QR Code (using a temporary promise-like approach because qrcode.js is sync but rendering might take a millisecond)
  new QRCode(qrContainer, {
    text: websiteUrl,
    width: 64,
    height: 64,
    colorDark: "#284b63",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  // Small delay to ensure QR is rendered in the hidden div
  await new Promise(resolve => setTimeout(resolve, 100));
  const qrImage = qrContainer.querySelector('img').src;

  // Header Logic (Dynamic from UI)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`GSTIN: ${formData.get('compGST')}`, 14, 12);
  doc.text(`CIN No.: ${formData.get('compCIN')}`, 105, 12, { align: 'center' });

  // Embed QR Code
  doc.addImage(qrImage, 'PNG', 170, 8, 25, 25);
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 120);
  doc.text('Scan for Website', 182.5, 36, { align: 'center' });
  doc.link(170, 8, 25, 30, { url: websiteUrl });

  doc.setFontSize(18);
  doc.setTextColor(40, 40, 120);
  doc.text('PERFORMA INVOICE', 105, 25, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text(formData.get('compName'), 105, 35, { align: 'center' });

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(formData.get('compAddress'), 105, 42, { align: 'center' });
  doc.text(`Mobile No. ${formData.get('compMobile')}`, 105, 48, { align: 'center' });

  // Bill To
  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  doc.text('Bill To:', 14, 60);
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const billTo = formData.get('billTo').split('\n');
  doc.text(billTo, 14, 68);

  // Invoice Details
  const invoiceDetailsY = 68 + (billTo.length * 5) + 5;
  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  doc.text('Invoice Details:', 14, invoiceDetailsY);
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice No.: ${formData.get('invoiceNo')}`, 14, invoiceDetailsY + 8);
  doc.text(`Date: ${formData.get('date')}`, 14, invoiceDetailsY + 14);

  // Table Data
  const rows = [];
  document.querySelectorAll('#items-body tr').forEach((tr, index) => {
    rows.push([
      index + 1,
      tr.querySelector('input[name="desc[]"]').value,
      tr.querySelector('input[name="hsn[]"]').value,
      tr.querySelector('input[name="qty[]"]').value,
      tr.querySelector('input[name="rate[]"]').value,
      tr.querySelector('input[name="amount[]"]').value
    ]);
  });

  doc.autoTable({
    startY: invoiceDetailsY + 20,
    head: [['S.No.', 'Description', 'HSN/SAC', 'Qty', 'Rate (Rs.)', 'Amount (Rs.)']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], halign: 'center' },
    columnStyles: {
      0: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    },
    alternateRowStyles: { fillColor: [230, 240, 255] }
  });

  // Totals
  let currentY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const subtotal = document.getElementById('subtotal').value;
  const gstRate = document.getElementById('gstRate').value;
  const cgst = document.getElementById('cgst').value;
  const sgst = document.getElementById('sgst').value;
  const total = document.getElementById('total').value;

  doc.text('Subtotal:', 140, currentY);
  doc.text(subtotal, 196, currentY, { align: 'right' });

  doc.text(`CGST @ ${gstRate}%:`, 140, currentY + 7);
  doc.text(cgst, 196, currentY + 7, { align: 'right' });

  doc.text(`SGST @ ${gstRate}%:`, 140, currentY + 14);
  doc.text(sgst, 196, currentY + 14, { align: 'right' });

  doc.setFillColor(0, 102, 204);
  doc.rect(138, currentY + 18, 60, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('Total Amount:', 140, currentY + 25);
  doc.text(total, 196, currentY + 25, { align: 'right' });

  currentY += 40;

  // Bank Details Section (Dynamic from UI)
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 120);
  doc.setFont(undefined, 'bold');
  doc.text("Company's Bank Details", 14, currentY);
  doc.text("Company's Bank Details", 105, currentY);

  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  // Bank 1
  doc.text(`Bank Name : ${formData.get('bank1Name')}`, 14, currentY + 7);
  doc.text(`A/c No.    : ${formData.get('bank1Acc')}`, 14, currentY + 13);
  doc.text(`IFSC Code  : ${formData.get('bank1IFSC')}`, 14, currentY + 19);
  doc.text(`Branch     : ${formData.get('bank1Branch')}`, 14, currentY + 25);

  // Bank 2
  doc.text(`Bank Name : ${formData.get('bank2Name')}`, 105, currentY + 7);
  doc.text(`A/c No.    : ${formData.get('bank2Acc')}`, 105, currentY + 13);
  doc.text(`IFSC Code  : ${formData.get('bank2IFSC')}`, 105, currentY + 19);
  doc.text(`Branch     : ${formData.get('bank2Branch')}`, 105, currentY + 25);

  currentY += 35;

  // Declaration
  doc.setFont(undefined, 'italic');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const declaration = formData.get('declaration');
  doc.text(declaration, 14, currentY, { maxWidth: 140 });

  // Signature Field (Always Visible)
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('__________________', 150, currentY + 25);
  doc.text('Auth. Signatory', 160, currentY + 31, { align: 'center' });

  if (!signaturePad.isEmpty()) {
    const signatureData = signaturePad.toDataURL();
    doc.addImage(signatureData, 'PNG', 150, currentY + 10, 40, 15);
  }

  doc.save('invoice.pdf');
});

// Initial calculation
updateAmounts();
