import express from 'express';
import { body, validationResult } from 'express-validator';
import WeeklyBrief from '../models/WeeklyBrief.js';
import Log from '../models/Log.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireSubscription } from '../middleware/requireSubscription.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// @desc    Get all weekly briefs for user
// @route   GET /api/briefs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const briefs = await WeeklyBrief.find({ userId: req.user._id })
      .sort({ weekEndDate: -1 })
      .limit(20);

    res.json(briefs);
  } catch (error) {
    console.error('Error fetching briefs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get a single weekly brief
// @route   GET /api/briefs/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const brief = await WeeklyBrief.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!brief) {
      return res.status(404).json({ message: 'Brief not found' });
    }

    res.json(brief);
  } catch (error) {
    console.error('Error fetching brief:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Download brief PDF
// @route   GET /api/briefs/:id/download
// @access  Private (Pro subscription required)
router.get('/:id/download', protect, requireSubscription(['pro', 'premium']), async (req, res) => {
  try {
    const brief = await WeeklyBrief.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!brief) {
      return res.status(404).json({ message: 'Brief not found' });
    }

    if (!brief.pdfPath || !fs.existsSync(brief.pdfPath)) {
      return res.status(404).json({ message: 'PDF file not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="weekly-brief-${brief.weekEndDate.toISOString().split('T')[0]}.pdf"`);
    
    const fileStream = fs.createReadStream(brief.pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading brief:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Generate a new weekly brief
// @route   POST /api/briefs/generate
// @access  Private (Pro subscription required)
router.post('/generate', protect, requireSubscription(['pro', 'premium']), async (req, res) => {
  try {
    const { weekStartDate, weekEndDate } = req.body;
    
    const startDate = weekStartDate ? new Date(weekStartDate) : getWeekStart(new Date());
    const endDate = weekEndDate ? new Date(weekEndDate) : getWeekEnd(new Date());

    // Check if brief already exists for this week
    const existingBrief = await WeeklyBrief.findOne({
      userId: req.user._id,
      weekStartDate: startDate,
      weekEndDate: endDate
    });

    if (existingBrief) {
      return res.status(400).json({ 
        message: 'A brief already exists for this week',
        briefId: existingBrief._id
      });
    }

    // Get logs for the week
    const logs = await Log.find({
      userId: req.user._id,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: 1 });

    if (logs.length === 0) {
      return res.status(400).json({ message: 'No logs found for this week' });
    }

    // Generate summary
    const summary = generateSummary(logs);

    // Generate PDF
    const pdfPath = await generatePDF(req.user, logs, summary, startDate, endDate);

    // Encrypt the summary
    const encryptedSummary = encryptData(JSON.stringify(summary));

    // Create the brief record
    const brief = await WeeklyBrief.create({
      userId: req.user._id,
      weekStartDate: startDate,
      weekEndDate: endDate,
      summary: encryptedSummary,
      pdfPath: pdfPath,
      logsCount: logs.length,
      generatedAt: new Date()
    });

    res.status(201).json({
      message: 'Weekly brief generated successfully',
      brief: {
        _id: brief._id,
        weekStartDate: brief.weekStartDate,
        weekEndDate: brief.weekEndDate,
        logsCount: brief.logsCount,
        generatedAt: brief.generatedAt
      }
    });
  } catch (error) {
    console.error('Error generating brief:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a weekly brief
// @route   DELETE /api/briefs/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const brief = await WeeklyBrief.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!brief) {
      return res.status(404).json({ message: 'Brief not found' });
    }

    // Delete PDF file if exists
    if (brief.pdfPath && fs.existsSync(brief.pdfPath)) {
      fs.unlinkSync(brief.pdfPath);
    }

    await brief.deleteOne();

    res.json({ message: 'Brief deleted successfully' });
  } catch (error) {
    console.error('Error deleting brief:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (7 - day);
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

function generateSummary(logs) {
  const summary = {
    totalLogs: logs.length,
    byType: {},
    byTone: {},
    avgIntensity: 0,
    trends: [],
    tags: {},
    highlights: []
  };

  let totalIntensity = 0;
  let intensityCount = 0;

  logs.forEach(log => {
    // Count by type
    summary.byType[log.type] = (summary.byType[log.type] || 0) + 1;

    // Count by tone
    if (log.tone) {
      summary.byTone[log.tone] = (summary.byTone[log.tone] || 0) + 1;
    }

    // Calculate average intensity
    if (log.meta?.intensity) {
      totalIntensity += log.meta.intensity;
      intensityCount++;
    }

    // Count tags
    if (log.meta?.tags) {
      log.meta.tags.forEach(tag => {
        summary.tags[tag] = (summary.tags[tag] || 0) + 1;
      });
    }

    // Add high intensity or urgent logs to highlights
    if (log.meta?.intensity >= 8 || log.tone === 'urgent') {
      summary.highlights.push({
        date: log.createdAt,
        type: log.type,
        text: log.text.substring(0, 100) + (log.text.length > 100 ? '...' : '')
      });
    }
  });

  summary.avgIntensity = intensityCount > 0 ? Math.round(totalIntensity / intensityCount * 10) / 10 : 0;

  // Generate simple trends
  if (summary.byType.symptom > summary.totalLogs * 0.5) {
    summary.trends.push('High symptom activity this week');
  }
  if (summary.byTone.negative > summary.byTone.positive) {
    summary.trends.push('More negative entries than positive');
  }
  if (summary.avgIntensity >= 7) {
    summary.trends.push('High average intensity - consider consulting a healthcare provider');
  }

  return summary;
}

async function generatePDF(user, logs, summary, startDate, endDate) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  let yPosition = height - 50;

  const drawText = (text, x, y, options = {}) => {
    page.drawText(text, {
      x,
      y,
      size: options.size || 12,
      font: options.bold ? boldFont : font,
      color: options.color || rgb(0, 0, 0)
    });
  };

  // Header
  drawText('MediEcho Weekly Health Brief', 50, yPosition, { size: 24, bold: true, color: rgb(0.15, 0.38, 0.92) });
  yPosition -= 30;

  drawText(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 50, yPosition, { size: 14 });
  yPosition -= 20;

  drawText(`Prepared for: ${user.name || user.email}`, 50, yPosition, { size: 12, color: rgb(0.4, 0.4, 0.4) });
  yPosition -= 40;

  // Summary Section
  drawText('Weekly Summary', 50, yPosition, { size: 18, bold: true });
  yPosition -= 25;

  drawText(`Total Entries: ${summary.totalLogs}`, 60, yPosition);
  yPosition -= 18;

  drawText(`Average Intensity: ${summary.avgIntensity}/10`, 60, yPosition);
  yPosition -= 25;

  // Entries by Type
  drawText('Entries by Type:', 60, yPosition, { bold: true });
  yPosition -= 18;

  Object.entries(summary.byType).forEach(([type, count]) => {
    drawText(`  • ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count}`, 70, yPosition);
    yPosition -= 15;
  });
  yPosition -= 15;

  // Trends
  if (summary.trends.length > 0) {
    drawText('Observations:', 60, yPosition, { bold: true });
    yPosition -= 18;

    summary.trends.forEach(trend => {
      drawText(`  • ${trend}`, 70, yPosition);
      yPosition -= 15;
    });
    yPosition -= 15;
  }

  // Highlights
  if (summary.highlights.length > 0) {
    drawText('Notable Entries:', 60, yPosition, { bold: true, color: rgb(0.8, 0.2, 0.2) });
    yPosition -= 18;

    summary.highlights.slice(0, 5).forEach(highlight => {
      const dateStr = new Date(highlight.date).toLocaleDateString();
      drawText(`  [${dateStr}] ${highlight.type}: ${highlight.text}`, 70, yPosition, { size: 10 });
      yPosition -= 15;
      if (yPosition < 100) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = height - 50;
      }
    });
  }

  // Footer
  yPosition = 50;
  drawText('Generated by MediEcho - Your Privacy-First Health Journal', 50, yPosition, { 
    size: 10, 
    color: rgb(0.5, 0.5, 0.5) 
  });
  drawText(`Generated on: ${new Date().toLocaleString()}`, 50, yPosition - 12, { 
    size: 8, 
    color: rgb(0.6, 0.6, 0.6) 
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  
  // Create briefs directory if it doesn't exist
  const briefsDir = path.join(process.cwd(), 'uploads', 'briefs');
  if (!fs.existsSync(briefsDir)) {
    fs.mkdirSync(briefsDir, { recursive: true });
  }

  const fileName = `brief_${user._id}_${Date.now()}.pdf`;
  const filePath = path.join(briefsDir, fileName);
  fs.writeFileSync(filePath, pdfBytes);

  return filePath;
}

function encryptData(data) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.JWT_SECRET || 'default-secret', 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: iv.toString('hex'),
    content: encrypted
  };
}

export default router;