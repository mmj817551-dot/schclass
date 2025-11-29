const { generateCSV, generatePDF } = require('../services/reportService');

async function monthly(req, res, next) {
  try {
    const month = req.query.month; // YYYY-MM
    const format = (req.query.format || 'csv').toLowerCase();
    const filename = `${month}_report.${format}`;
    if (format === 'csv') {
      const buf = await generateCSV(month);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      return res.end(buf);
    }
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      const doc = await generatePDF(month, res);
      return doc.pipe(res);
    }
    const err = new Error('格式不支持'); err.status = 400; err.code = 'VALIDATION_ERROR'; throw err;
  } catch (e) { return next(e); }
}

module.exports = { monthly };

