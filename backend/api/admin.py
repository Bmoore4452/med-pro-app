from django.contrib import admin
from api.models import UxTelemetryEvent


@admin.register(UxTelemetryEvent)
class UxTelemetryEventAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
        "user",
        "event_type",
        "stage",
        "level",
        "assessment_id",
    )
    list_filter = ("event_type", "stage", "level", "created_at")
    search_fields = ("user__email", "event_type", "stage", "level")
    ordering = ("-created_at", "-id")
