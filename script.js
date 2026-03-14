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

document.getElementById('add-row').addEventListener('click', function() {
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
  tr.querySelector('.remove-row').addEventListener('click', function() {
    tr.remove();
    updateAmounts();
  });
});

document.querySelectorAll('input[name="qty[]"], input[name="rate[]"]').forEach(input => {
  input.addEventListener('input', updateAmounts);
});
document.getElementById('gstRate').addEventListener('change', updateAmounts);

document.querySelectorAll('.remove-row').forEach(btn => {
  btn.addEventListener('click', function() {
    btn.closest('tr').remove();
    updateAmounts();
  });
});

document.getElementById('invoice-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header Logic
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 120);
  doc.text('PERFORMA INVOICE', 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('FIREFLIES INFOTECH PVT. LTD.', 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('Head Office: 7/17-A Parwati Bangla Road, Kanpur (U.P.) - 208002', 105, 32, { align: 'center' });
  doc.text('GSTIN: 09AACCF9544M2Z0 | Mobile: 8896961906, 9415052356', 105, 38, { align: 'center' });

  // Bill To
  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  doc.text('Bill To:', 14, 50);
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const billTo = document.getElementById('billTo').value.split('\n');
  doc.text(billTo, 14, 58);

  // Invoice Details
  const invoiceDetailsY = 58 + (billTo.length * 5) + 5;
  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  doc.text('Invoice Details:', 14, invoiceDetailsY);
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice No.: ${document.querySelector('input[name="invoiceNo"]').value}`, 14, invoiceDetailsY + 8);
  doc.text(`Date: ${document.querySelector('input[name="date"]').value}`, 14, invoiceDetailsY + 14);

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
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const subtotal = document.getElementById('subtotal').value;
  const gstRate = document.getElementById('gstRate').value;
  const cgst = document.getElementById('cgst').value;
  const sgst = document.getElementById('sgst').value;
  const total = document.getElementById('total').value;

  doc.text('Subtotal:', 140, finalY);
  doc.text(subtotal, 196, finalY, { align: 'right' });
  
  doc.text(`CGST @ ${gstRate}%:`, 140, finalY + 7);
  doc.text(cgst, 196, finalY + 7, { align: 'right' });
  
  doc.text(`SGST @ ${gstRate}%:`, 140, finalY + 14);
  doc.text(sgst, 196, finalY + 14, { align: 'right' });

  doc.setFillColor(0, 102, 204);
  doc.rect(138, finalY + 18, 60, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('Total Amount:', 140, finalY + 25);
  doc.text(total, 196, finalY + 25, { align: 'right' });

  // Declaration
  doc.setFont(undefined, 'italic');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const declaration = document.getElementById('declaration').value;
  doc.text(declaration, 14, finalY + 40, { maxWidth: 180 });

  doc.save('invoice.pdf');
});

// Initial calculation
updateAmounts();
