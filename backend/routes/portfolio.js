const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const Activity = require('../models/Activity');
const User = require('../models/User');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Generate Enhanced PDF Portfolio
router.post('/generate', auth, async (req, res) => {
  try {
    console.log('🎨 Generating enhanced portfolio for:', req.user.userId);
    
    // Get user data
    const user = await User.findById(req.user.userId);
    const activities = await Activity.find({ 
      student: req.user.userId, 
      status: 'approved' 
    }).sort({ date: -1 });

    // Calculate statistics
    const totalCredits = activities.reduce((sum, act) => sum + (act.credits || 0), 0);
    const activityTypes = [...new Set(activities.map(act => act.type))];
    
    // Group activities by type for better organization
    const groupedActivities = activities.reduce((groups, activity) => {
      const type = activity.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(activity);
      return groups;
    }, {});

    // Generate enhanced HTML for PDF
    const htmlContent = generateEnhancedPortfolioHTML(user, activities, groupedActivities, totalCredits, activityTypes);
    
    // Create PDF using Puppeteer with enhanced settings
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '10mm', right: '10mm' },
      preferCSSPageSize: true
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${user.name.replace(/\s+/g, '-')}-Academic-Portfolio.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Portfolio generation error:', error);
    res.status(500).json({ message: 'Error generating portfolio', error: error.message });
  }
});

// Enhanced HTML Template for Portfolio
function generateEnhancedPortfolioHTML(user, activities, groupedActivities, totalCredits, activityTypes) {
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  // Activity type icons and colors
  const typeConfig = {
    conference: { icon: '📚', color: '#3B82F6', name: 'Conferences' },
    workshop: { icon: '🛠️', color: '#8B5CF6', name: 'Workshops' },
    certification: { icon: '🏆', color: '#10B981', name: 'Certifications' },
    competition: { icon: '🥇', color: '#F59E0B', name: 'Competitions' },
    internship: { icon: '💼', color: '#6366F1', name: 'Internships' },
    volunteer: { icon: '❤️', color: '#EC4899', name: 'Volunteer Work' },
    leadership: { icon: '⭐', color: '#EF4444', name: 'Leadership' },
    community: { icon: '🤝', color: '#14B8A6', name: 'Community Service' }
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${user.name} - Academic Portfolio</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          line-height: 1.6; 
          color: #1F2937; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border-radius: 20px;
          overflow: hidden;
        }
        
        /* Header Section */
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center; 
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .profile-section {
          position: relative;
          z-index: 2;
        }
        
        .profile-avatar {
          width: 120px;
          height: 120px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: bold;
          border: 4px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(10px);
        }
        
        .header h1 { 
          font-size: 36px; 
          font-weight: 700; 
          margin-bottom: 8px; 
          letter-spacing: -1px;
        }
        
        .header .subtitle { 
          font-size: 16px; 
          opacity: 0.9; 
          margin-bottom: 8px;
          font-weight: 400;
        }
        
        .header .date { 
          font-size: 14px; 
          opacity: 0.8; 
          font-weight: 300;
        }
        
        /* Stats Section */
        .stats-section { 
          padding: 40px 30px; 
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
        }
        
        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 20px; 
        }
        
        .stat-card { 
          background: white;
          padding: 25px 20px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #E2E8F0;
          transition: transform 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .stat-number { 
          font-size: 32px; 
          font-weight: 700; 
          color: #3B82F6; 
          display: block;
          margin-bottom: 5px;
        }
        
        .stat-label { 
          font-size: 14px; 
          color: #6B7280; 
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Activities Section */
        .activities-section { 
          padding: 40px 30px; 
        }
        
        .activity-type-section {
          margin-bottom: 40px;
        }
        
        .activity-type-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #E2E8F0;
        }
        
        .activity-type-icon {
          font-size: 24px;
          margin-right: 12px;
        }
        
        .activity-type-title {
          font-size: 20px;
          font-weight: 600;
          color: #1F2937;
        }
        
        .activity-count {
          margin-left: auto;
          background: #F1F5F9;
          color: #475569;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .activity-grid {
          display: grid;
          gap: 16px;
        }
        
        .activity-card { 
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px; 
          padding: 20px;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        
        .activity-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--accent-color, #3B82F6);
        }
        
        .activity-card:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .activity-title { 
          font-size: 16px;
          font-weight: 600;
          color: #1F2937;
          line-height: 1.4;
          flex: 1;
          margin-right: 15px;
        }
        
        .activity-meta { 
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 8px;
          gap: 12px;
        }
        
        .activity-type-badge { 
          background: var(--accent-color, #3B82F6);
          color: white;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .activity-date {
          font-weight: 500;
        }
        
        .activity-description { 
          color: #4B5563;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        
        .activity-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          font-size: 12px;
          color: #6B7280;
        }
        
        .activity-details strong { 
          color: #374151; 
          font-weight: 500;
        }
        
        .credits-badge { 
          position: absolute;
          top: 15px;
          right: 15px;
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }
        
        /* Footer */
        .footer { 
          background: #F8FAFC;
          text-align: center; 
          padding: 30px;
          border-top: 1px solid #E2E8F0;
          color: #6B7280;
        }
        
        .footer-logo {
          font-size: 18px;
          font-weight: 600;
          color: #3B82F6;
          margin-bottom: 8px;
        }
        
        .footer-text {
          font-size: 12px;
          line-height: 1.5;
        }
        
        /* Page break control */
        .page-break {
          page-break-before: always;
        }
        
        @media print {
          body { background: white; }
          .container { box-shadow: none; border-radius: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Enhanced Header -->
        <div class="header">
          <div class="profile-section">
            <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <h1>${user.name}</h1>
            <div class="subtitle">${user.email} • ${user.studentId || user.facultyId || 'N/A'} • ${user.department || 'N/A'}</div>
            <div class="date">Academic Portfolio • Generated on ${currentDate}</div>
          </div>
        </div>

        <!-- Enhanced Stats Section -->
        <div class="stats-section">
          <h2 class="section-title">Portfolio Summary</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-number">${activities.length}</span>
              <div class="stat-label">Total Activities</div>
            </div>
            <div class="stat-card">
              <span class="stat-number">${totalCredits}</span>
              <div class="stat-label">Credits Earned</div>
            </div>
            <div class="stat-card">
              <span class="stat-number">${activityTypes.length}</span>
              <div class="stat-label">Activity Categories</div>
            </div>
          </div>
        </div>

        <!-- Enhanced Activities Section -->
        <div class="activities-section">
          <h2 class="section-title">Academic Activities</h2>
          
          ${Object.entries(groupedActivities).map(([type, typeActivities]) => {
            const config = typeConfig[type] || { icon: '📋', color: '#6B7280', name: type.charAt(0).toUpperCase() + type.slice(1) };
            
            return `
              <div class="activity-type-section">
                <div class="activity-type-header">
                  <span class="activity-type-icon">${config.icon}</span>
                  <span class="activity-type-title">${config.name}</span>
                  <span class="activity-count">${typeActivities.length} ${typeActivities.length === 1 ? 'Activity' : 'Activities'}</span>
                </div>
                
                <div class="activity-grid">
                  ${typeActivities.map(activity => `
                    <div class="activity-card" style="--accent-color: ${config.color}">
                      <div class="credits-badge">${activity.credits || 0} Credits</div>
                      
                      <div class="activity-header">
                        <h3 class="activity-title">${activity.title}</h3>
                      </div>
                      
                      <div class="activity-meta">
                        <span class="activity-type-badge" style="background: ${config.color}">${activity.type.toUpperCase()}</span>
                        <span class="activity-date">${new Date(activity.date).toLocaleDateString('en-GB')}</span>
                      </div>
                      
                      <div class="activity-description">${activity.description}</div>
                      
                      <div class="activity-details">
                        ${activity.organizer ? `<div><strong>Organizer:</strong> ${activity.organizer}</div>` : '<div></div>'}
                        ${activity.duration ? `<div><strong>Duration:</strong> ${activity.duration}</div>` : '<div></div>'}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Enhanced Footer -->
        <div class="footer">
          <div class="footer-logo">Smart Student Hub</div>
          <div class="footer-text">
            This portfolio contains verified academic activities and achievements.<br>
            Generated on ${currentDate} • All activities have been approved by faculty members.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;
