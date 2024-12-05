const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const columnSelector = document.getElementById('columnSelector');
const columnsDiv = document.getElementById('columns');
const convertForm = document.getElementById('convertForm');

let uploadedData = [];

// Handle file upload
uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const { headers } = await response.json();
      uploadedData = headers;

      // Display column headers for selection
      columnsDiv.innerHTML = '';
      headers.forEach((header) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = header;
        checkbox.id = header;
        const label = document.createElement('label');
        label.htmlFor = header;
        label.textContent = header;
        columnsDiv.appendChild(checkbox);
        columnsDiv.appendChild(label);
        columnsDiv.appendChild(document.createElement('br'));
      });

      columnSelector.style.display = 'block';
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    console.error('Upload failed:', err);
    alert('Failed to upload file.');
  }
});

// Handle XML conversion
convertForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const selectedColumns = Array.from(columnsDiv.querySelectorAll('input:checked')).map(
    (checkbox) => checkbox.value
  );

  if (selectedColumns.length === 0) {
    alert('Please select at least one column.');
    return;
  }

  try {
    const response = await fetch('/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: uploadedData, selectedColumns }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'converted.xml';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    console.error('Conversion failed:', err);
    alert('Failed to convert file.');
  }
});
