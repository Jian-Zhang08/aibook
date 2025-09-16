/**
 * Script to generate a demo PDF for The Great Gatsby
 * Run with: node src/scripts/create-gatsby-pdf.js
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Ensure the samples directory exists
const samplesDir = path.join(process.cwd(), 'public', 'samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
  console.log(`Created directory: ${samplesDir}`);
}

// Create the PDF file path
const outputPath = path.join(samplesDir, 'the-great-gatsby.pdf');

// Create a document
const doc = new PDFDocument();

// Pipe its output to the file
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Set metadata
doc.info['Title'] = 'The Great Gatsby';
doc.info['Author'] = 'F. Scott Fitzgerald';
doc.info['Subject'] = 'Classic American Literature';

// Add content
doc.fontSize(24).text('The Great Gatsby', { align: 'center' });
doc.moveDown();
doc.fontSize(16).text('by F. Scott Fitzgerald', { align: 'center' });
doc.moveDown(2);

// Add some placeholder text from the beginning of the novel
doc.fontSize(12).text(
  'In my younger and more vulnerable years my father gave me some advice that I\'ve been turning over in my mind ever since.\n\n' +
  '"Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven\'t had the advantages that you\'ve had."\n\n' +
  'He didn\'t say any more, but we\'ve always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I\'m inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores. The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men. Most of the confidences were unsought — frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quivering on the horizon; for the intimate revelations of young men, or at least the terms in which they express them, are usually plagiaristic and marred by obvious suppressions. Reserving judgments is a matter of infinite hope. I am still a little afraid of missing something if I forget that, as my father snobbishly suggested, and I snobbishly repeat, a sense of the fundamental decencies is parcelled out unequally at birth.',
  { align: 'justify' }
);

// Add page number to first page
doc.fontSize(10).text(
  'Page 1 of 2',
  doc.page.width - 100,
  doc.page.height - 50,
  { align: 'right' }
);

// Add a new page with a reminder
doc.addPage();
doc.fontSize(14).text('Demo PDF for BookBuddy App', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text(
  'This is a placeholder PDF for the demo version of The Great Gatsby.\n\n' +
  'For a complete reading experience, please upload a full version of the book or another PDF of your choice.',
  { align: 'center' }
);

// Add page number to second page
doc.fontSize(10).text(
  'Page 2 of 2',
  doc.page.width - 100,
  doc.page.height - 50,
  { align: 'right' }
);

// Finalize the PDF
doc.end();

// Listen for the stream to finish
stream.on('finish', () => {
  console.log(`Created demo PDF: ${outputPath}`);
  console.log('You can now test the "Read the Book" feature with the Great Gatsby demo');
}); 