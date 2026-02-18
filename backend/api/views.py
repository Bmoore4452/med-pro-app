from django.shortcuts import render
from django.conf import settings
from rest_framework.views import APIView
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.db.models import Count


from api import serializer as api_serializer
from userauths.models import (
    User,
    Profile,
    Result,
    Feedback,
    QuestionLevel,
    QuestionType,
    AssessmentQuestion,
    Choice,
    AssessmentResponse,
    Assessment,
)

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, status, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.response import Response

from rest_framework.permissions import IsAdminUser
from django.utils import timezone
import logging

import random
from api.models import UxTelemetryEvent

logger = logging.getLogger(__name__)


def _safe_percent(numerator, denominator):
    if denominator <= 0:
        return None
    return round((numerator / denominator) * 100, 2)


# Create your views here.


class MyTokenObtainView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

    def create(self, request, *args, **kwargs):
        # print("📨 Register Payload:", request.data)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print("❌ Validation Error:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def generate_random_otp(Length=7):
    otp = "".join([str(random.randint(0, 9)) for _ in range(Length)])
    return otp


class PasswordResetEmailVerifyAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def get_object(self):
        email = self.kwargs["email"]  # api/v1/password-email-verify/desphixs@gmail.com/

        user = User.objects.filter(email=email).first()

        if user:
            uuidb64 = user.pk
            refresh = RefreshToken.for_user(user)
            refresh_token = str(refresh.access_token)

            user.refresh_token = refresh_token
            user.otp = generate_random_otp()
            user.save()

            link = f"http://localhost:5173/create-new-password/?otp={user.otp}&uuidb64={uuidb64}&refresh_token={refresh_token}"

            context = {"link": link, "username": user.username}

            subject = "Password Rest Email"
            text_body = render_to_string("email/password_reset.txt", context)
            html_body = render_to_string("email/password_reset.html", context)

            msg = EmailMultiAlternatives(
                subject=subject,
                from_email=settings.FROM_EMAIL,
                to=[user.email],
                body=text_body,
            )

            msg.attach_alternative(html_body, "text/html")
            msg.send()

            print("link ======", link)
        return user


class PasswordChangeAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def create(self, request, *args, **kwargs):
        otp = request.data["otp"]
        uuidb64 = request.data["uuidb64"]
        password = request.data["password"]

        user = User.objects.get(id=uuidb64, otp=otp)
        if user:
            user.set_password(password)
            user.otp = ""
            user.save()

            return Response(
                {"message": "Password changed successfully"},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"message": "User does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )


class SubmitResponsesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print("🔎 Incoming request:", request.data)  # Add this line
        serializer = api_serializer.SubmitResponsesSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        print("❌ Invalid data:", serializer.errors)  # Add this line too
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AssessmentQuestionListView(generics.ListAPIView):
    serializer_class = api_serializer.AssessmentQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        level = self.request.query_params.get("level")
        return AssessmentQuestion.objects.filter(level=level)


class AssessmentResponseSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data
        print("🔎 Incoming data:", data)  # Debugging line

        assessment_id = data.get("assessment")
        profile_id = data.get("profile")
        question_id = data.get("question")

        if not all([assessment_id, profile_id, question_id]):
            return Response(
                {
                    "detail": "assessment, profile, and question are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        selected_choice_id = data.get("selected_choice")
        text_response = data.get("text_response")

        assessment = Assessment.objects.filter(id=assessment_id).first()
        profile = Profile.objects.filter(id=profile_id).first()
        question = AssessmentQuestion.objects.filter(id=question_id).first()

        if not assessment or not profile or not question:
            return Response(
                {"detail": "Invalid assessment, profile, or question."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        selected_choice = None
        if selected_choice_id:
            selected_choice = Choice.objects.filter(
                id=selected_choice_id, question=question
            ).first()
            if not selected_choice:
                return Response(
                    {"detail": "Selected choice is invalid for this question."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        response, _ = AssessmentResponse.objects.update_or_create(
            assessment=assessment,
            profile=profile,
            question=question,
            defaults={
                "selected_choice": selected_choice,
                "text_response": text_response,
                "is_correct": selected_choice.is_correct if selected_choice else None,
            },
        )

        return Response(
            {
                "message": "Response submitted successfully.",
                "response_id": response.id,
            },
            status=status.HTTP_200_OK,
        )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = api_serializer.ProfileSerializer(profile)
        return Response(serializer.data)


class UserMeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "id": request.user.id,
                "email": request.user.email,
                "full_name": request.user.full_name,
                "is_staff": request.user.is_staff,
            }
        )


class StartAssessmentAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)

        # Create a new assessment starting at level 1
        assessment = Assessment.objects.create(profile=profile, current_level="1")

        # Prepopulate responses for level 1
        questions = AssessmentQuestion.objects.filter(level="1")
        for question in questions:
            AssessmentResponse.objects.create(
                assessment=assessment,
                profile=profile,
                question=question,
            )

        return Response(
            {
                "assessment_id": assessment.id,
                "message": "Assessment started at Level 1.",
            },
            status=status.HTTP_201_CREATED,
        )


class SubmitAssessmentAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        assessment_id = request.data.get("assessment_id")
        assessment = Assessment.objects.filter(id=assessment_id).first()
        if not assessment:
            return Response(
                {"detail": "Assessment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if assessment.profile.user != request.user:
            return Response(
                {"detail": "You are not allowed to submit this assessment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if assessment.completed_at:
            return Response(
                {
                    "message": "Assessment already completed.",
                    "completed": True,
                },
                status=status.HTTP_200_OK,
            )

        current_level = assessment.current_level

        print(f"Assessment ID: {assessment.id}")
        print(f"Current Level: {current_level}")

        # Calculate the score for the current level
        responses = AssessmentResponse.objects.filter(
            assessment=assessment, question__level=current_level
        )
        print(f"Total Responses: {responses.count()}")
        for response in responses:
            print(
                f"Response ID: {response.id}, Question Level: {response.question.level}"
            )
        total_questions = responses.count()
        print("🤣", total_questions)
        correct_answers = responses.filter(is_correct=True).count()

        if total_questions == 0:
            return Response(
                {"message": "No responses found for the current level."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        score = (correct_answers / total_questions) * 100
        passed = score >= 60

        # Save or update latest result record for this profile+level
        existing_result = (
            Result.objects.filter(profile=assessment.profile, level=current_level)
            .order_by("-id")
            .first()
        )
        if existing_result:
            existing_result.score = round(score, 2)
            existing_result.passed = passed
            existing_result.save(update_fields=["score", "passed"])
        else:
            Result.objects.create(
                profile=assessment.profile,
                level=current_level,
                score=round(score, 2),
                passed=passed,
            )

        if passed:
            # Progress to the next level if not the last level
            if current_level == "3":
                assessment.completed_at = timezone.now()
                assessment.save()
                return Response(
                    {
                        "message": "Assessment completed. All levels passed!",
                        "level": current_level,
                        "score": round(score, 2),
                        "passed": True,
                        "next_level": None,
                        "completed": True,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                next_level = str(int(current_level) + 1)
                assessment.current_level = next_level
                assessment.save()

                # Prepopulate responses for the next level
                questions = AssessmentQuestion.objects.filter(level=next_level)
                for question in questions:
                    AssessmentResponse.objects.get_or_create(
                        assessment=assessment,
                        profile=assessment.profile,
                        question=question,
                    )

                return Response(
                    {
                        "message": f"Level {current_level} passed. Proceed to Level {next_level}.",
                        "level": current_level,
                        "score": round(score, 2),
                        "passed": True,
                        "next_level": next_level,
                        "completed": False,
                    },
                    status=status.HTTP_200_OK,
                )
        else:
            # End the assessment if the user fails
            assessment.completed_at = timezone.now()
            assessment.save()
            return Response(
                {
                    "message": f"Level {current_level} failed. Assessment ended.",
                    "level": current_level,
                    "score": round(score, 2),
                    "passed": False,
                    "next_level": None,
                    "completed": True,
                },
                status=status.HTTP_200_OK,
            )


class AssessmentResultsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profile = Profile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"results": []}, status=status.HTTP_200_OK)

        latest_assessment = (
            Assessment.objects.filter(profile=profile)
            .order_by("-completed_at", "-started_at", "-id")
            .first()
        )

        if not latest_assessment:
            return Response({"results": []}, status=status.HTTP_200_OK)

        payload = []
        for level in ["1", "2", "3"]:
            responses = AssessmentResponse.objects.filter(
                assessment=latest_assessment,
                question__level=level,
                selected_choice__isnull=False,
            )
            total_questions = responses.count()
            if total_questions == 0:
                continue

            correct_answers = responses.filter(is_correct=True).count()
            score = round((correct_answers / total_questions) * 100, 2)
            passed = score >= 60
            last_response = responses.order_by("-submitted_at").first()

            payload.append(
                {
                    "level": level,
                    "score": score,
                    "passed": passed,
                    "date": (last_response.submitted_at if last_response else None),
                    "feedback": None,
                }
            )

        return Response({"results": payload}, status=status.HTTP_200_OK)


class AssessmentHistoryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profile = Profile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"history": []}, status=status.HTTP_200_OK)

        assessments = Assessment.objects.filter(profile=profile).order_by(
            "-started_at", "-id"
        )

        history = []
        for assessment in assessments:
            responses = (
                AssessmentResponse.objects.filter(assessment=assessment)
                .select_related("question", "selected_choice")
                .order_by("question__level", "id")
            )

            if not responses.exists():
                continue

            question_ids = [response.question_id for response in responses]
            correct_choice_map = {
                choice.question_id: choice.text
                for choice in Choice.objects.filter(
                    question_id__in=question_ids, is_correct=True
                )
            }

            level_results = []
            for level in ["1", "2", "3"]:
                level_responses = responses.filter(
                    question__level=level, selected_choice__isnull=False
                )
                total_questions = level_responses.count()
                if total_questions == 0:
                    continue
                correct_answers = level_responses.filter(is_correct=True).count()
                score = round((correct_answers / total_questions) * 100, 2)
                passed = score >= 60
                last_level_response = level_responses.order_by("-submitted_at").first()

                level_results.append(
                    {
                        "level": level,
                        "score": score,
                        "passed": passed,
                        "date": (
                            last_level_response.submitted_at
                            if last_level_response
                            else assessment.completed_at
                        ),
                    }
                )

            if not level_results:
                continue

            history.append(
                {
                    "assessment_id": assessment.id,
                    "started_at": assessment.started_at,
                    "completed_at": assessment.completed_at,
                    "level_results": level_results,
                    "question_review": [
                        {
                            "question_id": response.question.id,
                            "level": response.question.level,
                            "question": response.question.text,
                            "selected_answer": (
                                response.selected_choice.text
                                if response.selected_choice
                                else None
                            ),
                            "correct_answer": correct_choice_map.get(
                                response.question_id
                            ),
                            "is_correct": response.is_correct,
                            "submitted_at": response.submitted_at,
                        }
                        for response in responses
                        if response.selected_choice
                    ],
                }
            )

        return Response({"history": history}, status=status.HTTP_200_OK)


class UxTelemetryEventAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = api_serializer.UxTelemetryEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload = serializer.validated_data
        event = UxTelemetryEvent.objects.create(
            user=request.user,
            event_type=payload.get("event_type"),
            stage=payload.get("stage") or "",
            level=payload.get("level") or "",
            assessment_id=payload.get("assessment_id"),
            time_left=payload.get("time_left"),
            details=payload.get("details") or {},
        )

        logger.info(
            "ux_telemetry_event user_id=%s event_type=%s stage=%s level=%s assessment_id=%s time_left=%s details=%s",
            request.user.id,
            event.event_type,
            event.stage,
            event.level,
            event.assessment_id,
            event.time_left,
            event.details,
        )

        return Response({"status": "accepted"}, status=status.HTTP_202_ACCEPTED)


class UxTelemetrySummaryAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        events = UxTelemetryEvent.objects.all()

        event_counts = {
            row["event_type"]: row["count"]
            for row in events.values("event_type")
            .annotate(count=Count("id"))
            .order_by()
        }

        stage_counts = {
            row["stage"]: row["count"]
            for row in events.exclude(stage="")
            .values("stage")
            .annotate(count=Count("id"))
            .order_by()
        }

        level_counts = {
            row["level"]: row["count"]
            for row in events.exclude(level="")
            .values("level")
            .annotate(count=Count("id"))
            .order_by()
        }

        ready_views = event_counts.get("assessment_ready_viewed", 0)
        starts = event_counts.get("assessment_started", 0)
        completions = event_counts.get("assessment_completed", 0)
        failures = event_counts.get("assessment_failed", 0)
        timeouts = event_counts.get("assessment_level_timeout", 0)
        exit_prompt_opens = event_counts.get("assessment_exit_prompt_opened", 0)
        exit_confirms = event_counts.get("assessment_exit_confirmed", 0)

        top_events = sorted(
            event_counts.items(), key=lambda item: item[1], reverse=True
        )[:8]

        last_event = events.order_by("-created_at", "-id").first()
        recent_events = list(
            events.values("created_at", "user_id", "event_type", "stage", "level")[:20]
        )

        return Response(
            {
                "total_events": events.count(),
                "distinct_users": events.values("user_id").distinct().count(),
                "last_event_at": last_event.created_at if last_event else None,
                "event_counts": event_counts,
                "stage_counts": stage_counts,
                "level_counts": level_counts,
                "top_events": [
                    {"event_type": event_type, "count": count}
                    for event_type, count in top_events
                ],
                "funnel": {
                    "ready_views": ready_views,
                    "starts": starts,
                    "completions": completions,
                    "start_rate_from_ready": _safe_percent(starts, ready_views),
                    "completion_rate_from_start": _safe_percent(completions, starts),
                },
                "dropoff": {
                    "failed": failures,
                    "timed_out": timeouts,
                    "exit_prompt_opened": exit_prompt_opens,
                    "exit_confirmed": exit_confirms,
                    "exit_confirm_rate": _safe_percent(
                        exit_confirms, exit_prompt_opens
                    ),
                },
                "recent_events": [
                    {
                        "at": item["created_at"],
                        "user_id": item["user_id"],
                        "event_type": item["event_type"],
                        "stage": item["stage"],
                        "level": item["level"],
                    }
                    for item in recent_events
                ],
                "note": "Telemetry summary is database-backed and persists across restarts.",
            },
            status=status.HTTP_200_OK,
        )
