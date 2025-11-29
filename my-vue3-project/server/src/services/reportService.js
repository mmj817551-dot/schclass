const PDFDocument = require('pdfkit');
const Reservation = require('../models/Reservation');

function monthRange(month) {
  // month: YYYY-MM
  const [y, m] = month.split('-').map((v) => parseInt(v, 10));
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

async function collectMonthlyRows(month) {
  const { from, to } = monthRange(month);
  const list = await Reservation.find({ 'slots.date': { $gte: from, $lte: to } })
    .populate('teacherId', 'name subject')
    .populate('roomId', 'name')
    .lean();

  const rows = [];
  for (const r of list) {
    for (const s of r.slots) {
      if (s.date < from || s.date > to) continue;
      rows.push({
        date: s.date,
        slot: s.slot,
        roomName: r.roomId?.name || String(r.roomId),
        subject: r.subject || '',
        teacherName: r.teacherId?.name || '',
        studentsCount: Array.isArray(r.studentIds) ? r.studentIds.length : 0,
      });
    }
  }
  // sort by date -> room -> slot
  rows.sort((a, b) => (a.date === b.date ? (a.roomName === b.roomName ? a.slot.localeCompare(b.slot) : a.roomName.localeCompare(b.roomName)) : (a.date < b.date ? -1 : 1)));
  return rows;
}

function toCSV(rows) {
  const header = ['date', 'slot', 'roomName', 'subject', 'teacherName', 'studentsCount'];
  const esc = (v) => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([r.date, r.slot, r.roomName, r.subject, r.teacherName, r.studentsCount].map(esc).join(','));
  }
  return lines.join('\n');
}

async function generateCSV(month) {
  const rows = await collectMonthlyRows(month);
  return Buffer.from(toCSV(rows), 'utf8');
}

async function generatePDF(month, res) {
  const rows = await collectMonthlyRows(month);
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.info.Title = `Monthly Report ${month}`;
  doc.fontSize(16).text(`月报 ${month}`, { align: 'center' });
  doc.moveDown(1);
  const header = ['日期', '时段', '教室', '科目', '教师', '人数'];
  doc.fontSize(10);
  const colX = [40, 120, 170, 240, 320, 420];
  function drawRow(vals) {
    vals.forEach((v, i) => doc.text(String(v ?? ''), colX[i], doc.y, { continued: i < vals.length - 1 }));
    doc.text('');
  }
  drawRow(header);
  doc.moveDown(0.2);
  doc.moveTo(40, doc.y).lineTo(540, doc.y).stroke();
  doc.moveDown(0.3);
  if (!rows.length) {
    doc.text('本月暂无数据', 40, doc.y + 6);
  } else {
    rows.forEach((r) => drawRow([r.date, r.slot, r.roomName, r.subject, r.teacherName, r.studentsCount]));
  }
  doc.end();
  return doc;
}

module.exports = { generateCSV, generatePDF };

