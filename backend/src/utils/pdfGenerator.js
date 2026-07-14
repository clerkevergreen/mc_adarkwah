const PDFDocument = require('pdfkit');

function generateContract(booking) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));

  const gold = '#C9A84C';
  const dark = '#1a1a2e';
  const gray = '#666';
  const lightGray = '#f4f4f4';
  const pageWidth = doc.page.width - 100;

  const leftCol = 50;
  const rightCol = pageWidth + 50;

  // Header bar
  doc.rect(0, 0, doc.page.width, 120).fill(dark);
  doc.fillColor(gold).fontSize(28).font('Helvetica-Bold').text('MC ADARKWAH', 50, 35);
  doc.fillColor('#fff').fontSize(12).font('Helvetica').text('Professional MC & Event Host', 50, 70);
  doc.fillColor(gold).fontSize(10).font('Helvetica').text('info@mcadarkwah.com  |  +44 7507 615314  |  mcadarkwah.com', 50, 92);

  // Title
  doc.fillColor(dark).fontSize(20).font('Helvetica-Bold').text('EVENT HOSTING CONTRACT', 50, 150);
  doc.moveTo(50, 178).lineTo(rightCol, 178).strokeColor(gold).lineWidth(2).stroke();

  // Reference
  doc.fillColor(gray).fontSize(10).font('Helvetica').text(
    `Contract Reference: CTR-${booking._id.toString().slice(-8).toUpperCase()}`,
    50, 195
  );
  doc.text(`Date Issued: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 50, 212);

  // Client section
  doc.fillColor(dark).fontSize(14).font('Helvetica-Bold').text('CLIENT DETAILS', 50, 245);
  doc.rect(50, 258, pageWidth, 1).fill(gold);

  const clientY = 275;
  doc.fillColor('#333').fontSize(11).font('Helvetica');
  doc.text(`Full Name:`, 50, clientY);
  doc.fillColor(dark).font('Helvetica-Bold').text(booking.fullName, 170, clientY);

  doc.fillColor('#333').font('Helvetica').text(`Email:`, 50, clientY + 22);
  doc.fillColor(dark).font('Helvetica-Bold').text(booking.email, 170, clientY + 22);

  doc.fillColor('#333').font('Helvetica').text(`Phone:`, 50, clientY + 44);
  doc.fillColor(dark).font('Helvetica-Bold').text(booking.phone || '-', 170, clientY + 44);

  // Event section
  const eventTop = clientY + 85;
  doc.fillColor(dark).fontSize(14).font('Helvetica-Bold').text('EVENT DETAILS', 50, eventTop);
  doc.rect(50, eventTop + 13, pageWidth, 1).fill(gold);

  const eventY = eventTop + 30;
  doc.fillColor('#333').fontSize(11).font('Helvetica');
  doc.text(`Event Type:`, 50, eventY);
  doc.fillColor(dark).font('Helvetica-Bold').text(booking.eventType, 170, eventY);

  doc.fillColor('#333').font('Helvetica').text(`Event Date:`, 50, eventY + 22);
  doc.fillColor(dark).font('Helvetica-Bold').text(
    new Date(booking.eventDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    170, eventY + 22
  );

  doc.fillColor('#333').font('Helvetica').text(`Location:`, 50, eventY + 44);
  doc.fillColor(dark).font('Helvetica-Bold').text(booking.eventLocation || 'TBD', 170, eventY + 44);

  doc.fillColor('#333').font('Helvetica').text(`Guests:`, 50, eventY + 66);
  doc.fillColor(dark).font('Helvetica-Bold').text(String(booking.guestCount || '-'), 170, eventY + 66);

  if (booking.budgetRange) {
    doc.fillColor('#333').font('Helvetica').text(`Budget Range:`, 50, eventY + 88);
    doc.fillColor(dark).font('Helvetica-Bold').text(booking.budgetRange, 170, eventY + 88);
  }

  // Notes
  if (booking.additionalNotes) {
    const notesY = Math.max(eventY + 130, 520);
    doc.fillColor(dark).fontSize(14).font('Helvetica-Bold').text('ADDITIONAL NOTES', 50, notesY);
    doc.rect(50, notesY + 13, pageWidth, 1).fill(gold);
    doc.fillColor('#333').fontSize(11).font('Helvetica').text(booking.additionalNotes, 50, notesY + 30);
  }

  // Terms and conditions
  const termsY = Math.max(doc.y + 40, 620);
  doc.fillColor(dark).fontSize(14).font('Helvetica-Bold').text('TERMS & CONDITIONS', 50, termsY);
  doc.rect(50, termsY + 13, pageWidth, 1).fill(gold);

  doc.fillColor(gray).fontSize(9.5).font('Helvetica');
  const terms = [
    '1. Booking Confirmation: This contract becomes binding upon confirmation by MC Adarkwah.',
    '2. Payment: A deposit may be required to secure the date. Full payment terms will be agreed separately.',
    '3. Cancellation: Cancellations must be made at least 14 days before the event date.',
    '4. Performance: MC Adarkwah will perform as agreed. Any changes to event requirements must be communicated at least 7 days prior.',
    '5. Liability: MC Adarkwah shall not be liable for any indirect or consequential losses arising from event cancellation beyond reasonable control.',
    '6. Governing Law: This agreement shall be governed by the laws of Ghana and the United Kingdom.',
  ];
  terms.forEach((term, i) => {
    doc.text(term, 50, (termsY + 33) + (i * 18));
  });

  // Signature section
  const sigY = Math.max(doc.y + 50, 750);
  doc.fillColor(dark).fontSize(14).font('Helvetica-Bold').text('SIGNATURES', 50, sigY);
  doc.rect(50, sigY + 13, pageWidth, 1).fill(gold);

  doc.fillColor('#333').fontSize(11).font('Helvetica');
  doc.text('Client Signature: ___________________________', 50, sigY + 35);
  doc.text('Date: ___________________________', 50, sigY + 58);

  doc.text('MC Adarkwah Signature: ___________________________', 50, sigY + 95);
  doc.text('Date: ___________________________', 50, sigY + 118);

  // Footer
  doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(dark);
  doc.fillColor(gold).fontSize(8).font('Helvetica').text(
    'MC Adarkwah  |  mcadarkwah.com  |  info@mcadarkwah.com  |  +44 7507 615314',
    50, doc.page.height - 28, { align: 'center' }
  );

  doc.end();
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

module.exports = { generateContract };
