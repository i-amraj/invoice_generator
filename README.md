# Professional Invoice Generator

A lightweight, professional, and client-side invoice generator built with HTML, CSS, and JavaScript. This tool allows users to generate and download professional PDF invoices instantly without any backend requirements.

## 🚀 Features

- **Instant PDF Generation**: Create professional invoices directly in your browser using `jsPDF`.
- **Auto-Calculations**: Dynamic calculation of subtotals, GST (CGST/SGST), and grand totals.
- **Dynamic Rows**: Easily add or remove items from the invoice table.
- **Professional Layout**: Includes company header, "Bill To" section, invoice details, itemized table, and declaration.
- **Standalone**: No Python, Node.js, or database required. Just open `index.html`.

## 🛠️ Built With

- **HTML5 & CSS3**: For structure and modern, clean styling.
- **Vanilla JavaScript**: For logic and interactivity.
- **jsPDF & jsPDF-AutoTable**: For high-quality PDF generation.

## 📖 How to Use

1. Open `index.html` in any modern web browser.
2. Fill in the "Bill To" details, Invoice Number, and Date.
3. Add your items (Description, HSN, Qty, Rate). The amounts will calculate automatically.
4. Select the GST rate from the dropdown.
5. Review the totals and the declaration.
6. Click **Generate PDF** to download the invoice.

## 📁 Project Structure

- `index.html`: The main user interface.
- `script.js`: Contains all calculation and PDF generation logic.
- `style.css`: Modern styling for the generator.

---

## ⚖️ License & Copyright

© 2026 **Raj**. All rights reserved.

This project is created and maintained by **Raj**. Unauthorised copying or distribution of this project is strictly prohibited.
