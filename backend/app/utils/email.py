import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM")

async def send_email(to_email: str, subject: str, html_content: str):
    """
    Sends an email using the configured SMTP server
    """
    msg = MIMEMultipart()
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    
    # Add HTML content
    msg.attach(MIMEText(html_content, "html"))
    
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False

# Email templates
async def send_registration_confirmation(to_email: str, user_name: str, workshop_name: str):
    subject = f"Registration Received: {workshop_name}"
    content = f"""
    <html>
    <body>
        <h2>Registration Confirmation</h2>
        <p>Dear {user_name},</p>
        <p>Thank you for registering for the workshop <strong>{workshop_name}</strong>.</p>
        <p>Your registration is being processed. You will receive another email once it's approved.</p>
        <p>Best regards,<br>Jnana Prabodhini Vijnana Dals Team</p>
    </body>
    </html>
    """
    return await send_email(to_email, subject, content)

async def send_registration_approval(to_email: str, user_name: str, workshop_name: str, workshop_date: str):
    subject = f"Registration Approved: {workshop_name}"
    content = f"""
    <html>
    <body>
        <h2>Registration Approved</h2>
        <p>Dear {user_name},</p>
        <p>Your registration for the workshop <strong>{workshop_name}</strong> has been approved!</p>
        <p>Workshop Date: {workshop_date}</p>
        <p>Please login to your dashboard to view more details.</p>
        <p>We look forward to seeing you at the workshop!</p>
        <p>Best regards,<br>Jnana Prabodhini Vijnana Dals Team</p>
    </body>
    </html>
    """
    return await send_email(to_email, subject, content)

async def send_otp_email(to_email: str, user_name: str, otp: str):
    subject = "Password Reset OTP"
    content = f"""
    <html>
    <body>
        <h2>Password Reset OTP</h2>
        <p>Dear {user_name},</p>
        <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>
        <p style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">{otp}</p>
        <p>This OTP is valid for 30 minutes.</p>
        <p>If you didn't request this, please ignore this email or contact us if you have concerns.</p>
        <p>Best regards,<br>Jnana Prabodhini Vijnana Dals Team</p>
    </body>
    </html>
    """
    return await send_email(to_email, subject, content)

async def send_password_reset(to_email: str, reset_link: str):
    subject = "Password Reset Request"
    content = f"""
    <html>
    <body>
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p><a href="{reset_link}">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Jnana Prabodhini Vijnana Dals Team</p>
    </body>
    </html>
    """
    return await send_email(to_email, subject, content)