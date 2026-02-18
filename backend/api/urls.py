from api import views as api_views
from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path(
        "user/token/", api_views.MyTokenObtainView.as_view(), name="token_obtain_pair"
    ),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("user/register/", api_views.RegisterView.as_view(), name="register"),
    path(
        "user/password-reset/<email>/",
        api_views.PasswordResetEmailVerifyAPIView.as_view(),
    ),
    path("user/password-change/", api_views.PasswordChangeAPIView.as_view()),
    path("user/", api_views.UserMeAPIView.as_view(), name="user-me"),
    path("user/profile/", api_views.UserProfileView.as_view(), name="user-profile"),
    # Assessment routes
    path(
        "assessment/questions/",
        api_views.AssessmentQuestionListView.as_view(),
        name="assessment-questions",
    ),
    path(
        "assessment/submit-response/",
        api_views.AssessmentResponseSubmitView.as_view(),
        name="submit-response",
    ),
    path(
        "assessment/start/",
        api_views.StartAssessmentAPIView.as_view(),
        name="start-assessment",
    ),
    path(
        "assessment/submit/",
        api_views.SubmitAssessmentAPIView.as_view(),
        name="submit-responses",
    ),
    path(
        "assessment/results/",
        api_views.AssessmentResultsAPIView.as_view(),
        name="assessment-results",
    ),
    path(
        "assessment/history/",
        api_views.AssessmentHistoryAPIView.as_view(),
        name="assessment-history",
    ),
    path(
        "assessment/telemetry/",
        api_views.UxTelemetryEventAPIView.as_view(),
        name="assessment-telemetry",
    ),
    path(
        "assessment/telemetry-summary/",
        api_views.UxTelemetrySummaryAPIView.as_view(),
        name="assessment-telemetry-summary",
    ),
]
