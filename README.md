# Professional Invoice Generator

A lightweight, professional, and client-side invoice generator built with HTML, CSS, and JavaScript. This tool allows users to generate and download professional PDF invoices instantly without any backend requirements.

## 🚀 Features

- **Stylish QR Code**: Automatically generates a QR code for your website URL and embeds it at the top right of the PDF.
- **Permanent Signature Field**: The signature line and "Auth. Signatory" text now always appear in the PDF, even without a digital signature.
- **Digital Signature Overlay**: Sign with mouse or touch, and it overlay on the signature line.
- **Fully Editable Settings**: Company info, bank details, and website URL can all be customized from the UI.

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
