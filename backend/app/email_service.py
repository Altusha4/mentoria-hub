import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from typing import Optional

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587").strip())
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").replace(" ", "")
FROM_EMAIL = (os.getenv("FROM_EMAIL", "") or SMTP_USER).strip()
APP_URL = os.getenv("APP_URL", "http://localhost:5173").strip()


def is_configured() -> bool:
    return bool(SMTP_USER and SMTP_PASSWORD)


def _risk_color(risk: str) -> str:
    return {"safe": "#22c55e", "attention": "#f59e0b", "risk": "#ef4444"}.get(risk, "#6b7280")


def _risk_emoji(risk: str) -> str:
    return {"safe": "🟢", "attention": "🟡", "risk": "🔴"}.get(risk, "⚪")


def _risk_label(risk: str) -> str:
    return {
        "safe": "Safe — no urgent deadlines",
        "attention": "Needs Attention — deadlines this week",
        "risk": "Deadline Risk — due today or tomorrow",
    }.get(risk, risk)


def _build_digest_html(student_name: str, digest: dict) -> str:
    risk = digest.get("risk_status", "safe")
    color = _risk_color(risk)
    emoji = _risk_emoji(risk)
    label = _risk_label(risk)

    deadlines_rows = ""
    for d in digest.get("upcoming_deadlines", []):
        days = d.get("days_left", 0)
        tag_color = "#ef4444" if days <= 1 else "#f59e0b" if days <= 3 else "#3b82f6"
        deadlines_rows += (
            f"<tr><td style='padding:10px 0;border-bottom:1px solid #f3f4f6;'>"
            f"<strong>{d['title']}</strong><br>"
            f"<span style='color:#6b7280;font-size:13px;'>{d['category']}</span></td>"
            f"<td style='padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;'>"
            f"<span style='background:{tag_color};color:white;padding:3px 10px;border-radius:20px;"
            f"font-size:12px;font-weight:bold;'>{days}d left</span></td></tr>"
        )
    if not deadlines_rows:
        deadlines_rows = "<tr><td style='padding:10px 0;color:#6b7280;'>No saved opportunities with upcoming deadlines.</td></tr>"

    courses_html = ""
    for c in digest.get("course_progress", []):
        pct = c.get("progress", 0)
        courses_html += (
            f"<div style='margin-bottom:14px;'>"
            f"<div style='display:flex;justify-content:space-between;margin-bottom:5px;'>"
            f"<span style='font-weight:600;'>{c['title']}</span>"
            f"<span style='color:#6b7280;font-size:13px;'>{pct:.0f}%</span></div>"
            f"<div style='background:#f3f4f6;border-radius:10px;height:8px;'>"
            f"<div style='background:#3b82f6;border-radius:10px;height:8px;width:{pct}%;'></div></div></div>"
        )
    if not courses_html:
        courses_html = "<p style='color:#6b7280;'>No enrolled courses yet.</p>"

    actions_html = "".join(
        f"<li style='margin-bottom:8px;padding-left:5px;'>{a}</li>"
        for a in digest.get("next_actions", [])
    )

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#1e40af 0%,#7c3aed 100%);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:12px;">🛡️</div>
      <h1 style="color:white;margin:0;font-size:28px;font-weight:800;">Mentoria Guardian</h1>
      <p style="color:#bfdbfe;margin:8px 0 0 0;font-size:14px;">Weekly Intelligence Report for {student_name}</p>
    </div>
    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;border-left:4px solid {color};box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="font-size:24px;margin-bottom:6px;">{emoji} Status</div>
      <div style="font-size:18px;font-weight:700;color:{color};">{label}</div>
    </div>
    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;">📅 Upcoming Deadlines</h2>
      <table style="width:100%;border-collapse:collapse;">{deadlines_rows}</table>
    </div>
    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;">📚 Course Progress</h2>
      {courses_html}
    </div>
    <div style="background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #bfdbfe;">
      <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;">⚡ Your Next Actions</h2>
      <ul style="margin:0;padding-left:20px;color:#374151;">{actions_html}</ul>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="{APP_URL}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#7c3aed);color:white;text-decoration:none;padding:14px 36px;border-radius:30px;font-weight:700;font-size:16px;">
        Open Mentoria Hub →
      </a>
    </div>
    <div style="text-align:center;color:#9ca3af;font-size:12px;">
      <p>Mentoria Guardian — Smart Education Assistant</p>
      <p>{datetime.now().strftime('%B %d, %Y')}</p>
    </div>
  </div>
</body>
</html>"""


def _send(to_email: str, subject: str, html: str) -> tuple[bool, Optional[str]]:
    if not is_configured():
        return False, "Email service not configured (missing SMTP_USER or SMTP_PASSWORD env vars)"
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = FROM_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())
        return True, None
    except Exception as e:
        return False, str(e)


def send_test_email(to_email: str, student_name: str) -> tuple[bool, Optional[str]]:
    html = f"""<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f8fafc;padding:20px;">
  <div style="max-width:500px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.1);text-align:center;">
    <div style="font-size:64px;margin-bottom:16px;">🛡️</div>
    <h1 style="color:#1e40af;margin-bottom:8px;">Mentoria Guardian</h1>
    <p style="color:#6b7280;margin-bottom:24px;">Email notifications are working!</p>
    <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="font-size:20px;font-weight:700;color:#16a34a;">✅ Test Successful</p>
      <p style="color:#374151;">Hi <strong>{student_name}</strong>, your email notifications are configured correctly.</p>
    </div>
    <a href="{APP_URL}" style="background:#1e40af;color:white;padding:12px 28px;border-radius:20px;text-decoration:none;font-weight:700;">
      Open Mentoria Hub →
    </a>
  </div>
</body>
</html>"""
    return _send(to_email, "🛡️ Mentoria Guardian — Test Notification", html)


def send_digest_email(to_email: str, student_name: str, digest: dict) -> tuple[bool, Optional[str]]:
    html = _build_digest_html(student_name, digest)
    subject = f"🛡️ Mentoria Guardian — Weekly Report for {student_name}"
    return _send(to_email, subject, html)


def send_deadline_email(
    to_email: str, student_name: str, opportunity_title: str, days_left: int
) -> tuple[bool, Optional[str]]:
    icon = "🚨" if days_left <= 1 else "⚠️"
    urgency_tag = "🔴 URGENT" if days_left <= 1 else "🟡 Reminder"
    days_text = "DUE TODAY!" if days_left == 0 else f"Due in {days_left} day{'s' if days_left != 1 else ''}"
    subject = f"{urgency_tag}: {opportunity_title} closes in {days_left}d"
    html = f"""<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f8fafc;padding:20px;">
  <div style="max-width:500px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;">🛡️</div>
      <h1 style="color:#1e40af;margin:8px 0;">Mentoria Guardian Alert</h1>
    </div>
    <p style="font-size:16px;">Hi <strong>{student_name}</strong>,</p>
    <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
      <div style="font-size:36px;">{icon}</div>
      <h2 style="color:#dc2626;margin:8px 0;">{opportunity_title}</h2>
      <p style="font-size:24px;font-weight:800;color:#ef4444;">{days_text}</p>
    </div>
    <div style="background:#f0fdf4;border-radius:10px;padding:16px;margin:20px 0;">
      <p style="font-weight:700;margin-bottom:8px;">Your next steps:</p>
      <p>✅ Review the requirements</p>
      <p>✅ Prepare your application</p>
      <p>✅ Submit before the deadline</p>
    </div>
    <div style="text-align:center;">
      <a href="{APP_URL}/opportunities" style="background:#1e40af;color:white;padding:12px 28px;border-radius:20px;text-decoration:none;font-weight:700;">
        Go to Opportunities →
      </a>
    </div>
  </div>
</body>
</html>"""
    return _send(to_email, subject, html)
