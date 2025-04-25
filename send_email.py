import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email information
smtp_server = 'smtp.gmail.com'
smtp_port = 587
from_email = 'om.chavan501@gmail.com'
from_password = 'wnun qyvm cpme qvbh'  # Use an app-specific password for Gmail.
to_email = 'sarabhai.dal@jnanaprabodhini.org'
subject = 'Test Email'
body = 'Hello, this is a test email sent from Python!'

# Create the email message
msg = MIMEMultipart()
msg['From'] = from_email
msg['To'] = to_email
msg['Subject'] = subject
msg.attach(MIMEText(body, 'plain'))

# Send the email via SMTP server
try:
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(from_email, from_password)
    server.send_message(msg)
    print("Email sent successfully!")
except Exception as e:
    print("Error:", e)
finally:
    server.quit()