const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

// Create a PDF document
const doc = new jsPDF();
const title = 'The Great Gatsby';
const author = 'F. Scott Fitzgerald';

// Read content from the placeholder file
const content = fs.readFileSync('placeholder.txt', 'utf8');
const lines = content.split('\n');

// Start position
let y = 20;

// Add title with larger font
doc.setFontSize(22);
doc.text(title, 105, y, { align: 'center' });
y += 10;

// Add author
doc.setFontSize(16);
doc.text(author, 105, y, { align: 'center' });
y += 20;

// Add content
doc.setFontSize(12);
for (const line of lines) {
  // Skip the title and author lines that we already added
  if (line === title || line === author || line === '') {
    continue;
  }
  // Check if we need a new page
  if (y > 280) {
    doc.addPage();
    y = 20;
  }
  // Add the line
  doc.text(line, 20, y);
  y += 7;
}

// Create the directory if it doesn't exist
const targetDir = path.join(process.cwd(), 'public', 'samples');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Save the PDF
const outputPath = path.join(targetDir, 'the-great-gatsby.pdf');
doc.save(outputPath);

console.log(`Demo PDF created at: ${outputPath}`); 