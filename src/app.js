const express = require('express');
const multer = require('multer');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
app.use(express.static('public'));

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

// Updated /upload route to extract headers and data starting from the third row
app.post('/upload', upload.single('file'), (req, res) => {
    try {
      const filePath = req.file.path;
  
      // Read the uploaded Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  
      // Validate file format
      if (sheetData.length < 3) {
        return res.status(400).json({ message: 'Invalid file format. At least 3 rows required.' });
      }
  
      // Extract headers from the third row
      const headers = sheetData[2].map((header) => (header || '').toString().trim().toLowerCase());
  
      // Extract data starting from the fourth row and filter out empty rows
      const rows = sheetData
        .slice(3) // Skip the first three rows
        .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell.toString().trim() !== '')) // Remove empty rows
        .map((row) => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || ''; // Handle missing data
          });
          return obj;
        });
  
      // Remove the uploaded file after processing
      fs.unlinkSync(filePath);
  
      res.json({ headers, data: rows });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ message: 'Error processing file', error: error.message });
    }
  });
  

// Route to handle XML conversion
app.post('/convert', express.json(), (req, res) => {
    try {
      const { data, selectedColumns } = req.body;
  
      // Validate input
      if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: 'Data is missing or invalid' });
      }
      if (!selectedColumns || !Array.isArray(selectedColumns) || selectedColumns.length === 0) {
        return res.status(400).json({ message: 'Selected columns are missing or invalid' });
      }
  
      // Extract headers from the provided data
      const headers = Object.keys(data[0]).map((header) => header.trim().toLowerCase());
  
      // Validate selected columns
      const validColumns = selectedColumns
        .map((col) => col.trim().toLowerCase())
        .filter((normalizedCol) => headers.includes(normalizedCol));
  
      if (validColumns.length === 0) {
        return res.status(400).json({ message: 'None of the selected columns exist in the data' });
      }
  
      // Generate XML content based on the required format
      let xmlContent = `<ENVELOPE>
  <HEADER>
  <VERSION>1</VERSION>
  <TALLYREQUEST>Import</TALLYREQUEST>
  <TYPE>Data</TYPE>
  <ID>Vouchers</ID>
  </HEADER>
  <BODY>
  <DESC>
  </DESC>
  <DATA>
  <TALLYMESSAGE>`;
  
      data.forEach((row) => {
        const DATE = row.DATE ? row.DATE.toString().replace(/-/g, '') : '';
        const NARRATION = row.NARRATION || '';
        const VOUCHERNUMBER = row["VOUCHER NO."] || '';
        const ACCOUNT = row.ACCOUNT || '';
        const WITHDRAWL = row.WITHDRAWL || '';
        const RECEIPT = row.RECEIPT || '';
  
        const voucherTypeName = WITHDRAWL ? "Payment" : "Receipt";
  
        xmlContent += `
  <VOUCHER>
  <DATE>${DATE}</DATE>
  <NARRATION>${NARRATION}</NARRATION>
  <VOUCHERTYPENAME>${voucherTypeName}</VOUCHERTYPENAME>
  <VOUCHERNUMBER>${VOUCHERNUMBER}</VOUCHERNUMBER>
  <ALLLEDGERENTRIES.LIST>
  <LEDGERNAME>${ACCOUNT}</LEDGERNAME>
  <ISDEEMEDPOSITIVE>${WITHDRAWL ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
  <AMOUNT>${WITHDRAWL ? `-${parseFloat(WITHDRAWL).toFixed(2)}` : `${parseFloat(RECEIPT || 0).toFixed(2)}`}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>
  <ALLLEDGERENTRIES.LIST>
  <LEDGERNAME>SBI_234</LEDGERNAME>
  <ISDEEMEDPOSITIVE>${WITHDRAWL ? "No" : "Yes"}</ISDEEMEDPOSITIVE>
  <AMOUNT>${WITHDRAWL ? `${parseFloat(WITHDRAWL).toFixed(2)}` : `-${parseFloat(RECEIPT || 0).toFixed(2)}`}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>
  </VOUCHER>`;
      });
  
      xmlContent += `
  </TALLYMESSAGE>
  </DATA>
  </BODY>
  </ENVELOPE>`;
  
      // Send XML response
      res.setHeader('Content-Disposition', 'attachment; filename=converted.xml');
      res.setHeader('Content-Type', 'application/xml');
      res.send(xmlContent);
    } catch (error) {
      console.error('Error converting to XML:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
  
  

module.exports = app;
