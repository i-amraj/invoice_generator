# 📄 Professional Invoice Generator & GitHub Sync

A modern, fast, and secure **Client-Side Invoice Generator** designed for professionals. This tool allows you to generate high-quality PDF invoices directly in your browser while automatically logging your activity to GitHub to keep your contribution graph green! 📈

![Invoice UI](screenshot/Screenshot%20from%202026-03-27%2015-18-58.png)
![Generated PDF](screenshot/Screenshot%20from%202026-03-27%2015-19-41.png)

## ✨ Key Features

- **🚀 Dynamic Invoice Types**: Switch between *Tax Invoice* and *Performa Invoice* with one click.
- **🔢 Auto-Numbering**: Unique invoice IDs generated automatically based on the current timestamp.
- **🛡️ Secure GitHub Sync**: Automatically updates an `activity_log.txt` in your repo every time an invoice is created.
- **🔒 Privacy First**: Your GitHub Token stays safe in a private **Google Apps Script** proxy. Your data never leaves your browser.
- **🖋️ Digital Signature**: Integrated signature pad for professional touch.
- **📱 Mobile Friendly**: Designed to work seamlessly on both Desktop and Mobile devices.
- **📁 Persistent Settings**: Remembers your company and bank details for your next visit.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Libraries**: `jsPDF` (PDF Generation), `SignaturePad` (Digital Signature), `QRCode.js` (Dynamic QR Codes)
- **Backend Proxy**: Google Apps Script (Secure Bridge to GitHub API)

## 🚀 How to Use

1. **Fill Details**: Enter your company, bank, and client information.
2. **Generate PDF**: Click the 'Generate PDF' button.
3. **Verify**: A secure custom modal will ask for your master password (`iamraj12` by default).
4. **Download & Sync**: 
   - Your professional PDF will download instantly.
   - Your GitHub contribution graph will get a new green dot! ✅

## 🔐 Security Architecture

This project uses a **Serverless Proxy** approach to protect sensitive information:
- The **GitHub Personal Access Token** is stored in your private Google Script environment.
- The web app sends a password-protected request to the script.
- The script verifies the password and pushes the commit to GitHub on your behalf.

## 🏷️ GitHub Topics (Tags)
`invoice-generator` `github-sync` `js-pdf` `google-apps-script` `contribution-graph` `vanilla-js` `client-side` `pwa` `tax-invoice` `hsn-sac`

---
Crafted with ❤️ by **Raj** & **Antigravity**.
