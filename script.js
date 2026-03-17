// Helper to save/load from localStorage - Updated: 2026-03-17 18:50
function saveSettings() {
  const form = document.getElementById('invoice-form');
  const formData = new FormData(form);
  const settings = {
    compName: formData.get('compName'),
    compGST: formData.get('compGST'),
    compCIN: formData.get('compCIN'),
    compMobile: formData.get('compMobile'),
    compWebsite: formData.get('compWebsite'),
    compAddress: formData.get('compAddress'),
    bank1Name: formData.get('bank1Name'),
    bank1Acc: formData.get('bank1Acc'),
    bank1IFSC: formData.get('bank1IFSC'),
    bank1Branch: formData.get('bank1Branch'),
    bank2Name: formData.get('bank2Name'),
    bank2Acc: formData.get('bank2Acc'),
    bank2IFSC: formData.get('bank2IFSC'),
    bank2Branch: formData.get('bank2Branch'),
    declaration: formData.get('declaration')
  };
  localStorage.setItem('invoice_settings', JSON.stringify(settings));
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('invoice_settings'));
  if (settings) {
    const form = document.getElementById('invoice-form');
    for (const key in settings) {
      if (form.elements[key]) {
        form.elements[key].value = settings[key];
      }
    }
  }
}

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

// Listen for changes in setting fields to auto-save
const settingFields = [
  'compName', 'compGST', 'compCIN', 'compMobile', 'compWebsite', 'compAddress',
  'bank1Name', 'bank1Acc', 'bank1IFSC', 'bank1Branch',
  'bank2Name', 'bank2Acc', 'bank2IFSC', 'bank2Branch',
  'declaration'
];
settingFields.forEach(name => {
  const elem = document.querySelector(`[name="${name}"]`);
  if (elem) elem.addEventListener('input', saveSettings);
});

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

  new QRCode(qrContainer, {
    text: websiteUrl,
    width: 64,
    height: 64,
    colorDark: "#284b63",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  await new Promise(resolve => setTimeout(resolve, 100));
  const qrImage = qrContainer.querySelector('img').src;

  // Professional Header Layout
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(40, 75, 99); // --primary
  doc.text('PERFORMA INVOICE', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`GSTIN: ${formData.get('compGST')} | CIN: ${formData.get('compCIN')}`, 105, 28, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(formData.get('compName'), 105, 38, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(formData.get('compAddress'), 105, 44, { align: 'center' });
  doc.text(`Mobile: ${formData.get('compMobile')} | Website: ${formData.get('compWebsite')}`, 105, 49, { align: 'center' });

  // QR Code
  doc.addImage(qrImage, 'PNG', 175, 10, 20, 20);

  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.line(14, 55, 196, 55);

  // Info Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 75, 99);
  doc.text('BILL TO:', 14, 65);
  doc.text('INVOICE DETAILS:', 105, 65);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Wrapped Bill To text
  const billToText = formData.get('billTo');
  const splitBillTo = doc.splitTextToSize(billToText, 80);
  doc.text(splitBillTo, 14, 72);

  doc.text(`Invoice No: ${formData.get('invoiceNo')}`, 105, 72);
  doc.text(`Date: ${formData.get('date')}`, 105, 78);

  // Table
  const tableRows = [];
  document.querySelectorAll('#items-body tr').forEach((tr, index) => {
    tableRows.push([
      index + 1,
      tr.querySelector('input[name="desc[]"]').value,
      tr.querySelector('input[name="hsn[]"]').value,
      tr.querySelector('input[name="qty[]"]').value,
      tr.querySelector('input[name="rate[]"]').value,
      tr.querySelector('input[name="amount[]"]').value
    ]);
  });

  doc.autoTable({
    startY: Math.max(95, 72 + (splitBillTo.length * 5)), // Push table down if address is long
    head: [['S.No.', 'Description', 'HSN/SAC', 'Qty', 'Rate', 'Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [40, 75, 99], textColor: [255, 255, 255], halign: 'center', fontSize: 9 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 'auto' }, // Allow description to wrap naturally
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 25 }
    },
    styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: [245, 248, 250] }
  });

  let finalY = doc.lastAutoTable.finalY + 10;

  // Totals
  doc.setFontSize(10);
  const subtotal = document.getElementById('subtotal').value;
  const gstRate = document.getElementById('gstRate').value;
  const cgst = document.getElementById('cgst').value;
  const sgst = document.getElementById('sgst').value;
  const total = document.getElementById('total').value;

  const totalLabelX = 140;
  const totalValueX = 196;

  // Check if we need a new page for totals if close to bottom
  if (finalY > 250) {
    doc.addPage();
    finalY = 20;
  }

  doc.text('Subtotal:', totalLabelX, finalY);
  doc.text(subtotal, totalValueX, finalY, { align: 'right' });

  doc.text(`CGST (${gstRate}%):`, totalLabelX, finalY + 6);
  doc.text(cgst, totalValueX, finalY + 6, { align: 'right' });

  doc.text(`SGST (${gstRate}%):`, totalLabelX, finalY + 12);
  doc.text(sgst, totalValueX, finalY + 12, { align: 'right' });

  doc.setFillColor(40, 75, 99);
  doc.rect(138, finalY + 16, 60, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT:', 140, finalY + 23);
  doc.text(total, 196, finalY + 23, { align: 'right' });

  // Bank Details
  finalY += 40;
  if (finalY > 230) { doc.addPage(); finalY = 20; }
  
  doc.setTextColor(40, 75, 99);
  doc.setFontSize(10);
  doc.text("BANK DETAILS", 14, finalY);
  doc.line(14, finalY + 2, 80, finalY + 2);

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${formData.get('bank1Name')}`, 14, finalY + 8);
  doc.text(`A/c: ${formData.get('bank1Acc')}`, 14, finalY + 13);
  doc.text(`IFSC: ${formData.get('bank1IFSC')}`, 14, finalY + 18);
  doc.text(`Branch: ${formData.get('bank1Branch')}`, 14, finalY + 23);

  // Declaration & Signature
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('DECLARATION:', 14, finalY + 35);
  doc.setFontSize(7);
  const declarationText = formData.get('declaration');
  const splitDeclaration = doc.splitTextToSize(declarationText, 120);
  doc.text(splitDeclaration, 14, finalY + 40);

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Authorized Signatory', 170, finalY + 55, { align: 'center' });

  if (!signaturePad.isEmpty()) {
    const signatureData = signaturePad.toDataURL();
    doc.addImage(signatureData, 'PNG', 150, finalY + 35, 40, 15);
  }

  // Robust Mobile Download
  try {
    const fileName = `${formData.get('invoiceNo').replace(/\//g, '_')}_Invoice.pdf`;
    console.log("Attempting to generate PDF: " + fileName);
    
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      alert("Mobile detected. Starting PDF generation...");
      
      const pdfBlob = doc.output('blob');
      if (!pdfBlob) throw new Error("Failed to generate PDF Blob");
      
      const blobURL = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobURL;
      link.download = fileName;
      
      // Some mobile browsers need the link added to DOM
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobURL);
        alert("Download triggered! Please check your downloads or notifications.");
      }, 500);
      
    } else {
      doc.save(fileName);
    }
  } catch (err) {
    console.error("PDF Error: ", err);
    alert("Error generating PDF: " + err.message);
  }
});

// Initial load
loadSettings();
updateAmounts();
