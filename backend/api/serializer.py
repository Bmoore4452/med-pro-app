from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from userauths.models import (
    User,
    Profile,
    AssessmentQuestion,
    Choice,
    AssessmentResponse,
    Result,
    Feedback,
)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["full_name"] = user.full_name
        token["email"] = user.email
        token["username"] = user.username
        return token


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["full_name", "email", "password", "password2"]

    def validate(self, attr):
        if attr["password"] != attr["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attr

    def create(self, validated_data):
        user = User.objects.create(
            full_name=validated_data["full_name"],
            email=validated_data["email"],
        )

        email_username, _ = user.email.split("@")
        user.username = email_username
        user.set_password(validated_data["password"])
        user.save()

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = "__all__"


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = AssessmentQuestion
        fields = ["id", "text", "level", "type", "choices"]


class AssessmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResponse
        fields = "__all__"

    def create(self, validated_data):
        response = super().create(validated_data)
        if response.selected_choice:
            response.is_correct = response.selected_choice.is_correct
            print(f"Response created: {response}, is_correct: {response.is_correct}")
            response.save()
        return response


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = "__all__"


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"


class SubmitResponsesSerializer(serializers.Serializer):
    profile_id = serializers.IntegerField()

    def validate_profile_id(self, value):
        if not Profile.objects.filter(id=value).exists():
            raise serializers.ValidationError("Profile not found.")
        print(f"Profile ID: {value}")  # Debugging line
        return value

    def create(self, validated_data):
        profile = Profile.objects.get(id=validated_data["profile_id"])
        feedback_data = {
            "1": "Improve your communication and patient interaction.",
            "2": "Focus on collaboration and delivering consistent care.",
            "3": "Review ethical protocols and decision-making best practices.",
        }

        results = []
        for level in ["1", "2", "3"]:
            total = 0
            correct = 0
            responses = AssessmentResponse.objects.filter(
                profile=profile, question__level=level, question__type="MC"
            )
            print(f"Responses for level {level}: {responses}")  # Debugging line
            total = int(responses.count())  # Ensure total is an integer
            correct = int(
                responses.filter(is_correct=True).count()
            )  # Ensure correct is an integer

            print(f"total: {total}")  # Debugging line
            print(f"correct: {correct}")  # Debugging line

            if total == 0:
                continue  # Avoid division by zero

            points_per_question = 100 / total
            score = round(correct * points_per_question, 2)
            passed = score >= 60

            result = Result.objects.create(
                profile=profile, level=level, score=score, passed=passed
            )

            result_data = {"level": level, "score": score, "passed": passed}

            if not passed:
                feedback_text = feedback_data.get(level, "Please improve.")
                Feedback.objects.create(result=result, recommendation=feedback_text)
                result_data["feedback"] = feedback_text
                results.append(result_data)
                break
            else:
                results.append(result_data)

        return {"results": results}


class UxTelemetryEventSerializer(serializers.Serializer):
    event_type = serializers.CharField(max_length=100)
    stage = serializers.CharField(max_length=30, required=False, allow_blank=True)
    level = serializers.CharField(max_length=10, required=False, allow_blank=True)
    assessment_id = serializers.IntegerField(required=False, allow_null=True)
    time_left = serializers.IntegerField(required=False, allow_null=True)
    details = serializers.JSONField(required=False)
