from django.shortcuts import render
from django.conf import settings
from rest_framework.views import APIView
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


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

import random

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

        serializer = api_serializer.AssessmentResponseSerializer(data=data)
        if serializer.is_valid():
            response = serializer.save()
            print("✅ Response saved:", serializer.data)  # Debugging line
            return Response(
                {"message": "Response submitted successfully."},
                status=status.HTTP_200_OK,
            )
        print("❌ Invalid data:", serializer.errors)  # Debugging line
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = api_serializer.ProfileSerializer(profile)
        return Response(serializer.data)


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
        assessment = Assessment.objects.get(id=assessment_id)
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

        # Save the result for the current level
        Result.objects.create(
            profile=assessment.profile,
            level=current_level,
            score=score,
            passed=passed,
        )

        if passed:
            # Progress to the next level if not the last level
            if current_level == "3":
                assessment.completed_at = timezone.now()
                assessment.save()
                return Response(
                    {"message": "Assessment completed. All levels passed!"},
                    status=status.HTTP_200_OK,
                )
            else:
                next_level = str(int(current_level) + 1)
                assessment.current_level = next_level
                assessment.save()

                # Prepopulate responses for the next level
                questions = AssessmentQuestion.objects.filter(level=next_level)
                for question in questions:
                    AssessmentResponse.objects.create(
                        assessment=assessment,
                        profile=assessment.profile,
                        question=question,
                    )

                return Response(
                    {
                        "message": f"Level {current_level} passed. Proceed to Level {next_level}."
                    },
                    status=status.HTTP_200_OK,
                )
        else:
            # End the assessment if the user fails
            assessment.completed_at = timezone.now()
            assessment.save()
            return Response(
                {"message": f"Level {current_level} failed. Assessment ended."},
                status=status.HTTP_200_OK,
            )
