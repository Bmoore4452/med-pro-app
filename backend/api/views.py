from django.shortcuts import render
from django.conf import settings
from rest_framework.views import APIView
from api.serializer import (
    MyTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)

from api import serializer as api_serializer
from userauths.models import User, Question, Answer, Response, Result, Feedback

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, status, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.response import Response

from rest_framework.permissions import IsAdminUser

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
