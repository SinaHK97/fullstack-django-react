from django.contrib.auth.models import AbstractUser, PermissionsMixin, BaseUserManager, UserManager
from django.db import models


class User(AbstractUser, PermissionsMixin):
    username = models.CharField(max_length=250)
    email = models.EmailField(unique=True, max_length=255)
    full_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "username"]


