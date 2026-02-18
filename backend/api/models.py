from django.conf import settings
from django.db import models


class UxTelemetryEvent(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ux_telemetry_events",
    )
    event_type = models.CharField(max_length=100)
    stage = models.CharField(max_length=30, blank=True)
    level = models.CharField(max_length=10, blank=True)
    assessment_id = models.IntegerField(null=True, blank=True)
    time_left = models.IntegerField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.event_type} by user {self.user_id} at {self.created_at}"
