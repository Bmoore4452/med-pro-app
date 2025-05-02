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
        fields = ["id", "text"]


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = AssessmentQuestion
        fields = ["id", "text", "level", "type", "choices"]


class AssessmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResponse
        fields = "__all__"


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = "__all__"


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"


def create(self, validated_data):
    profile = Profile.objects.get(id=validated_data["profile_id"])
    feedback_data = {
        "1": "Improve your communication and patient interaction.",
        "2": "Focus on collaboration and delivering consistent care.",
        "3": "Review ethical protocols and decision-making best practices.",
    }

    results = []
    for level in ["1", "2", "3"]:
        responses = AssessmentResponse.objects.filter(
            profile=profile, question__level=level, question__type="MC"
        )
        total = responses.count()
        correct = responses.filter(is_correct=True).count()
        score = (correct / total * 100) if total > 0 else 0
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
            break  # Stop progression to next level
        else:
            results.append(result_data)

    return {"results": results}
