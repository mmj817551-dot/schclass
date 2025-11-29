// 月报自动导出 + 可选对象存储留存
// 用法：node src/scripts/report-cron.js 2025-11
// 若不传月份，则默认导出上一个自然月

const fs = require('fs');
const path = require('path');
const { connect } = require('../config/db');
const env = require('../config/env');
const { generateCSV, generatePDF } = require('../services/reportService');

function prevMonthStr() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function uploadToS3IfConfigured(filePath, key) {
  const { S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET } = process.env;
  if (!S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    console.log('[report-cron] S3 not configured, skip upload:', key);
    return false;
  }
  try {
    // 动态加载，避免未安装时报错
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const client = new S3Client({
      region: S3_REGION || 'auto',
      endpoint: S3_ENDPOINT || undefined,
      forcePathStyle: !!S3_ENDPOINT,
      credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
    });
    const body = fs.readFileSync(filePath);
    await client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: body }));
    console.log('[report-cron] Uploaded to S3:', key);
    return true;
  } catch (e) {
    console.error('[report-cron] Upload failed:', e.message);
    return false;
  }
}

async function main() {
  const month = process.argv[2] || prevMonthStr();
  await connect();

  const outDir = path.resolve(process.cwd(), 'reports', month);
  fs.mkdirSync(outDir, { recursive: true });

  // CSV
  const csvBuf = await generateCSV(month);
  const csvName = `${month}_report.csv`;
  const csvPath = path.join(outDir, csvName);
  fs.writeFileSync(csvPath, csvBuf);

  // PDF
  const pdfName = `${month}_report.pdf`;
  const pdfPath = path.join(outDir, pdfName);
  const pdfStream = fs.createWriteStream(pdfPath);
  const doc = await require('../services/reportService').generatePDF(month);
  doc.pipe(pdfStream);
  doc.end();
  await new Promise((resolve) => pdfStream.on('finish', resolve));

  // Optional upload to S3
  const prefix = process.env.S3_PREFIX || 'reports/';
  await uploadToS3IfConfigured(csvPath, `${prefix}${month}/${csvName}`);
  await uploadToS3IfConfigured(pdfPath, `${prefix}${month}/${pdfName}`);

  console.log('[report-cron] Exported:', csvPath, pdfPath);
}

main().catch((e) => { console.error(e); process.exit(1); });

