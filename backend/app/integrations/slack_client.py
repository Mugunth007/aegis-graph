import httpx
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("aegis.integration.slack")

class SlackIntegration:
    """
    Sends rich incident alert and resolution notifications to Slack.
    """
    def __init__(self):
        self.webhook_url = settings.SLACK_WEBHOOK_URL

    async def send_incident_notification(self, incident_id: str, culprit_sha: str, blast_count: int, pr_url: str) -> Dict[str, Any]:
        if not self.webhook_url:
            logger.info("SLACK_WEBHOOK_URL not configured; simulating Slack dispatch.")
            return {"sent": False, "simulated": True, "message": "Notification simulated for #core-platform"}

        payload = {
            "text": f"🚨 *AEGIS-GRAPH Alert: {incident_id} Neutralized*",
            "blocks": [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": f"🚨 Incident {incident_id} Remediated"}
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Root Cause:*\nCommit `{culprit_sha}` (RFC-104)"},
                        {"type": "mrkdwn", "text": f"*Blast Radius:*\n{blast_count} Downstream Services"}
                    ]
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": f"*Hotfix Pull Request Ready:*\n<{pr_url}|Review and Merge PR #104>"}
                }
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(self.webhook_url, json=payload)
                return {"sent": resp.status_code == 200, "status_code": resp.status_code}
        except Exception as e:
            logger.error(f"Failed to post to Slack: {e}")
            return {"sent": False, "error": str(e)}

slack_client = SlackIntegration()
