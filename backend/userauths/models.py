from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save

# --- User and Profile Models ---


class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    full_name = models.CharField(max_length=100, unique=True)
    otp = models.CharField(max_length=100, null=True, blank=True)
    refresh_token = models.CharField(max_length=1000, null=True, blank=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        email_username, _ = self.email.split("@")
        if not self.full_name:
            self.full_name = email_username
        if not self.username:
            self.username = email_username
        super(User, self).save(*args, **kwargs)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name or self.user.full_name

    def save(self, *args, **kwargs):
        if not self.full_name:
            self.full_name = self.user.username
        super(Profile, self).save(*args, **kwargs)


# --- Assessment System ---


class QuestionLevel(models.TextChoices):
    LEVEL_1 = "1", "Soft Skills / Professionalism"
    LEVEL_2 = "2", "Teamwork / Quality of Care"
    LEVEL_3 = "3", "Ethical Decision-Making"


class QuestionType(models.TextChoices):
    MULTIPLE_CHOICE = "MC", "Multiple Choice"
    OPEN_ENDED = "OE", "Open Ended"


class AssessmentQuestion(models.Model):
    level = models.CharField(max_length=1, choices=QuestionLevel.choices)
    type = models.CharField(max_length=2, choices=QuestionType.choices)
    text = models.TextField()

    def __str__(self):
        return f"{self.get_level_display()}: {self.text[:50]}"


class Choice(models.Model):
    question = models.ForeignKey(
        AssessmentQuestion, on_delete=models.CASCADE, related_name="choices"
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text


class Assessment(models.Model):
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="assessments"
    )
    current_level = models.CharField(
        max_length=1, choices=QuestionLevel.choices, default="1"
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Assessment for {self.profile.full_name} - Current Level {self.current_level}"


class AssessmentResponse(models.Model):
    assessment = models.ForeignKey(
        Assessment, on_delete=models.CASCADE, related_name="responses", null=True,
        blank=True
    )
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="assessment_responses"
    )
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(
        Choice, on_delete=models.SET_NULL, null=True, blank=True
    )
    text_response = models.TextField(null=True, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response by {self.profile.full_name} to Q{self.question.id}"


class Result(models.Model):
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="results"
    )
    level = models.CharField(max_length=1, choices=QuestionLevel.choices)
    score = models.FloatField()
    passed = models.BooleanField()

    def __str__(self):
        return f"{self.profile.full_name} - Level {self.get_level_display()} Result"


class Feedback(models.Model):
    result = models.OneToOneField(
        Result, on_delete=models.CASCADE, related_name="feedback"
    )
    recommendation = models.TextField()

    def __str__(self):
        return f"Feedback for {self.result}"


# --- Signals ---


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)
