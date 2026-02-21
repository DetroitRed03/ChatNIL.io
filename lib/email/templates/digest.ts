import { baseTemplate } from './base';
import { EMAIL_CONFIG } from '../config';

interface DigestStats {
  pending: number;
  urgent: number;
  approvedToday: number;
  rejectedToday: number;
  avgReviewTime: string;
}

interface AthleteDigestStats {
  activeDeals: number;
  pendingDeals: number;
  totalEarnings: number;
  profileViews: number;
}

export const digestEmails = {
  complianceDaily: (officerName: string, stats: DigestStats, topItems: Array<{ athlete: string; company: string; priority: string }>) => ({
    subject: `Daily Compliance Report - ${stats.pending} pending reviews`,
    html: baseTemplate({
      title: 'Daily Compliance Report',
      preheader: `${stats.urgent} urgent items need attention`,
      content: `
        <div class="header">
          <h1>Daily Report</h1>
          <p class="subtitle">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div class="content">
          <p>Good morning, ${officerName}!</p>

          <div class="stat-grid">
            <div class="stat-card">
              <div class="number">${stats.pending}</div>
              <div class="label">Pending</div>
            </div>
            <div class="stat-card" style="${stats.urgent > 0 ? 'background: #fef2f2;' : ''}">
              <div class="number" style="${stats.urgent > 0 ? 'color: #ef4444;' : ''}">${stats.urgent}</div>
              <div class="label">Urgent</div>
            </div>
            <div class="stat-card" style="background: #f0fdf4;">
              <div class="number" style="color: #22c55e;">${stats.approvedToday}</div>
              <div class="label">Approved</div>
            </div>
          </div>

          ${topItems.length > 0 ? `
            <h3>Priority Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #f9fafb;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Athlete</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Company</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Priority</th>
              </tr>
              ${topItems.map(item => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.athlete}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.company}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                    <span class="badge ${
                      item.priority === 'urgent' ? 'badge-danger' :
                      item.priority === 'high' ? 'badge-warning' : 'badge-info'
                    }">${item.priority}</span>
                  </td>
                </tr>
              `).join('')}
            </table>
          ` : ''}

          <p style="text-align: center; margin-top: 24px;">
            <a href="${EMAIL_CONFIG.appUrl}/compliance/dashboard" class="button">Open Dashboard</a>
          </p>

          <hr class="divider">

          <p style="color: #6b7280; font-size: 13px; text-align: center;">
            Avg. review time: ${stats.avgReviewTime} &bull;
            <a href="${EMAIL_CONFIG.appUrl}/settings/notifications">Change digest frequency</a>
          </p>
        </div>
      `,
    }),
  }),

  athleteWeekly: (athleteName: string, stats: AthleteDigestStats) => ({
    subject: 'Your weekly NIL summary',
    html: baseTemplate({
      title: 'Weekly Summary',
      preheader: 'Your NIL activity this week',
      content: `
        <div class="header">
          <h1>Weekly Summary</h1>
          <p class="subtitle">Your NIL activity this week</p>
        </div>
        <div class="content">
          <p>Hi ${athleteName}!</p>
          <p>Here's a summary of your NIL activity this week:</p>

          <div class="stat-grid">
            <div class="stat-card">
              <div class="number">${stats.activeDeals}</div>
              <div class="label">Active Deals</div>
            </div>
            <div class="stat-card">
              <div class="number">${stats.pendingDeals}</div>
              <div class="label">Pending</div>
            </div>
            <div class="stat-card" style="background: #f0fdf4;">
              <div class="number" style="color: #22c55e;">$${(stats.totalEarnings / 1000).toFixed(1)}K</div>
              <div class="label">Earnings</div>
            </div>
          </div>

          <div class="info-box">
            <strong>Profile Views:</strong> ${stats.profileViews} this week
          </div>

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/dashboard" class="button">View Dashboard</a>
          </p>
        </div>
      `,
    }),
  }),

  parentWeekly: (parentName: string, athleteName: string, activities: Array<{ type: string; description: string; date: string }>) => ({
    subject: `${athleteName}'s NIL activity this week`,
    html: baseTemplate({
      title: 'Weekly Activity Report',
      preheader: `Stay informed about ${athleteName}'s NIL activities`,
      content: `
        <div class="header">
          <h1>Weekly Update</h1>
          <p class="subtitle">${athleteName}'s NIL activity</p>
        </div>
        <div class="content">
          <p>Hi ${parentName},</p>
          <p>Here's what's been happening with ${athleteName}'s NIL activities this week:</p>

          ${activities.length > 0 ? `
            <div style="margin: 20px 0;">
              ${activities.map(activity => `
                <div style="padding: 12px; border-left: 3px solid #f97316; background: #fff7ed; margin-bottom: 8px; border-radius: 0 8px 8px 0;">
                  <strong>${activity.type}</strong><br>
                  <span style="color: #6b7280;">${activity.description}</span><br>
                  <small style="color: #9ca3af;">${activity.date}</small>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="info-box">
              No new activity this week.
            </div>
          `}

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/parent/dashboard" class="button">View Full Dashboard</a>
          </p>
        </div>
      `,
    }),
  }),
};
