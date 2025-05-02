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
        "assessment/submit/",
        api_views.SubmitResponsesAPIView.as_view(),
        name="submit-responses",
    ),
    path("user/profile/", api_views.UserProfileView.as_view(), name="user-profile"),
]
