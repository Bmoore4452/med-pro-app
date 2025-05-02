from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save

# Create your models here.


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
        email_username, full_name = self.email.split("@")
        if self.full_name == "" or self.full_name == None:
            self.full_name = email_username
        if self.username == "" or self.username == None:
            self.username = email_username
        super(User, self).save(*args, **kwargs)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.full_name:
            return str(self.full_name)
        else:
            return str(self.user.full_name)

    def save(self, *args, **kwargs):
        if self.full_name == "" or self.full_name == None:
            self.full_name = self.user.username
        super(Profile, self).save(*args, **kwargs)


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class Question(models.Model):
    LEVEL_CHOICES = [
        (1, "Level 1"),
        (2, "Level 2"),
        (3, "Level 3"),
    ]
    CATEGORY_CHOICES = [
        ("Communication", "Communication"),
        ("Ethics", "Ethics"),
        # Add more as needed
    ]
    text = models.TextField()
    level = models.IntegerField(choices=LEVEL_CHOICES)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)

    def __str__(self):
        return f"{self.text[:50]}"


class Answer(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="answers"
    )
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"Answer to: {self.question}"


class Response(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="responses")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answers = models.ManyToManyField(Answer)
    is_correct = models.BooleanField()

    def __str__(self):
        return f"{self.user.email} answered {self.question}"


class Result(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="results")
    level = models.IntegerField()
    score = models.FloatField()
    passed = models.BooleanField()

    def __str__(self):
        return f"{self.user.email} - Level {self.level} Result"


class Feedback(models.Model):
    result = models.OneToOneField(
        Result, on_delete=models.CASCADE, related_name="feedback"
    )
    recommendation = models.TextField()

    def __str__(self):
        return f"Feedback for {self.result}"


post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)
