import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate stylish HTML email template for rating request
const generateRatingEmailTemplate = (
  travelerName: string,
  guideName: string,
  guideImage: string,
  startDate: string,
  endDate: string,
  ratingLink: string
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rate Your Guide Experience</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px 20px 0 0;">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ✈️ TravelBuddy
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Your Adventure Companion
              </p>
            </td>
          </tr>
        </table>
        
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a1a2e; font-size: 24px; font-weight: 600;">
                Hi ${travelerName}! 👋
              </h2>
              
              <p style="margin: 0 0 25px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your trip with your local guide has been completed! We hope you had an amazing experience exploring together.
              </p>
              
              <!-- Guide Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 16px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 80px; vertical-align: top;">
                          <img src="${guideImage || 'https://via.placeholder.com/80'}" alt="${guideName}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea;">
                        </td>
                        <td style="padding-left: 15px; vertical-align: middle;">
                          <h3 style="margin: 0 0 8px; color: #1a1a2e; font-size: 20px; font-weight: 600;">
                            ${guideName}
                          </h3>
                          <p style="margin: 0; color: #64748b; font-size: 14px;">
                            🗓️ ${startDate} - ${endDate}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 25px; color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center;">
                <strong>Your feedback matters!</strong><br>
                Please take a moment to rate your experience and help other travelers.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${ratingLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                      ⭐ Rate Your Guide
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #94a3b8; font-size: 13px; text-align: center; line-height: 1.5;">
                This link will expire in 7 days.<br>
                If you have any issues, please contact our support team.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: #1a1a2e; border-radius: 0 0 20px 20px;">
          <tr>
            <td style="padding: 25px 30px; text-align: center;">
              <p style="margin: 0 0 10px; color: rgba(255,255,255,0.7); font-size: 14px;">
                Thank you for traveling with TravelBuddy! 🌍
              </p>
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                © ${new Date().getFullYear()} TravelBuddy. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Send rating request email
export const sendRatingEmail = async (
  travelerEmail: string,
  travelerName: string,
  guideName: string,
  guideImage: string,
  startDate: Date,
  endDate: Date,
  ratingToken: string
): Promise<boolean> => {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("⚠️ SMTP not configured. Skipping email send.");
      console.log(`📧 Rating link would be: ${process.env.FRONTEND_URL}/rate-guide/${ratingToken}`);
      return false;
    }

    const transporter = createTransporter();
    const ratingLink = `${process.env.FRONTEND_URL}/rate-guide/${ratingToken}`;
    
    const formattedStartDate = new Date(startDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    
    const formattedEndDate = new Date(endDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || `TravelBuddy <${process.env.SMTP_USER}>`,
      to: travelerEmail,
      subject: `⭐ Rate your experience with ${guideName} - TravelBuddy`,
      html: generateRatingEmailTemplate(
        travelerName,
        guideName,
        guideImage,
        formattedStartDate,
        formattedEndDate,
        ratingLink
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Rating email sent to ${travelerEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send rating email:", error);
    return false;
  }
};
