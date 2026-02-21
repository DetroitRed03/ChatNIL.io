import { EMAIL_CONFIG } from '../config';

interface BaseTemplateParams {
  title: string;
  preheader?: string;
  content: string;
  footerText?: string;
  accentColor?: string;
}

export function baseTemplate({
  title,
  preheader,
  content,
  footerText,
  accentColor = '#f97316',
}: BaseTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, ${accentColor}, ${adjustColor(accentColor, -20)}); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .header .subtitle { color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: ${accentColor}; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .button-secondary { background: #6b7280; }
    .footer { text-align: center; padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
    .footer p { color: #6b7280; font-size: 13px; margin: 5px 0; }
    .footer a { color: ${accentColor}; text-decoration: none; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .info-box { background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .alert-box { border-left: 4px solid ${accentColor}; background: #fff7ed; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .stat-grid { display: flex; gap: 12px; margin: 20px 0; }
    .stat-card { flex: 1; background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-card .number { font-size: 28px; font-weight: 700; color: #1f2937; }
    .stat-card .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    @media only screen and (max-width: 600px) {
      .container { padding: 10px; }
      .content { padding: 20px; }
      .stat-grid { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${content}
      <div class="footer">
        <p><strong>ChatNIL</strong> - NIL Compliance Made Simple</p>
        <p>${footerText || 'You received this email because you have an account with ChatNIL.'}</p>
        <p>
          <a href="${EMAIL_CONFIG.appUrl}/settings/notifications">Notification Settings</a> &bull;
          <a href="${EMAIL_CONFIG.appUrl}/support">Help Center</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
