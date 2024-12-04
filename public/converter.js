document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const fileNameSpan = document.getElementById('fileName');
  const processButton = document.getElementById('processButton');
  let uploadedData = [];
  let bankAccountName = '';

  // Handle file selection
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
      fileNameSpan.textContent = 'No file chosen';
      return;
    }

    fileNameSpan.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

      bankAccountName = sheetData[1]?.[2]?.toString().trim() || 'Unknown';
      uploadedData = sheetData.slice(3).filter((row) => row.some((cell) => cell !== null && cell !== undefined));

      // Validate for '&' character
      for (let row of uploadedData) {
        for (let cell of row) {
          if (typeof cell === 'string' && cell.includes('&')) {
            alert("Invalid file: contains '&' character. Please remove it and try again.");
            return;
          }
        }
      }

      alert(`File successfully uploaded! Bank Account Name: ${bankAccountName}`);
    };

    reader.readAsArrayBuffer(file);
  });

  // Handle process button click
  processButton.addEventListener('click', () => {
    if (uploadedData.length === 0) {
      alert('Please upload a valid file before processing.');
      return;
    }

    let xmlContent = `<ENVELOPE>
<HEADER>
<VERSION>1</VERSION>
<TALLYREQUEST>Import</TALLYREQUEST>
<TYPE>Data</TYPE>
<ID>Vouchers</ID>
</HEADER>
<BODY>
<DESC></DESC>
<DATA>
<TALLYMESSAGE>`;

    uploadedData.forEach((row) => {
      const date = XLSX.SSF.format('yyyyMMdd', row[1]);
      const narration = row[2] || '';
      const voucherNumber = row[3] || '';
      const account = row[4] || '';
      const withdrawal = row[5];
      const receipt = row[6];
      const isWithdrawal = withdrawal && !isNaN(parseFloat(withdrawal));
      const amount = parseFloat(isWithdrawal ? withdrawal : receipt).toFixed(2);

      xmlContent += `
<VOUCHER>
<DATE>${date}</DATE>
<NARRATION>${narration}</NARRATION>
<VOUCHERTYPENAME>${isWithdrawal ? 'Payment' : 'Receipt'}</VOUCHERTYPENAME>
<VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
<ALLLEDGERENTRIES.LIST>
<LEDGERNAME>${bankAccountName}</LEDGERNAME>
<ISDEEMEDPOSITIVE>${isWithdrawal ? 'Yes' : 'No'}</ISDEEMPOSITIVE>
<AMOUNT>${isWithdrawal ? `-${amount}` : amount}</AMOUNT>
</ALLLEDGERENTRIES.LIST>
<ALLLEDGERENTRIES.LIST>
<LEDGERNAME>${bankAccountName}</LEDGERNAME>
<ISDEEMPOSITIVE>${isWithdrawal ? 'No' : 'Yes'}</ISDEEMPOSITIVE>
<AMOUNT>${isWithdrawal ? amount : `-${amount}`}</AMOUNT>
</ALLLEDGERENTRIES.LIST>
</VOUCHER>`;
    });

    xmlContent += `
</TALLYMESSAGE>
</DATA>
</BODY>
</ENVELOPE>`;

    // Trigger download of the generated XML
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ConvertedFile.xml';
    a.click();
    window.URL.revokeObjectURL(url);
  });
});
