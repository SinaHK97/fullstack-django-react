from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    # TokenRefreshView,
)
from user.views import RegisterView
from rest_framework_simplejwt.views import TokenBlacklistView

urlpatterns = [
    path('auth/register', RegisterView.as_view()),
    path('auth/login', TokenObtainPairView.as_view()),
    path('auth/logout', TokenBlacklistView.as_view()),
    # path('api/token/refresh/', TokenRefreshView.as_view()),
]