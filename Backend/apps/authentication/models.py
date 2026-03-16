from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from .manager import CustomUserManager

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('user',       'User'),
        ('admin',      'Admin'),
        ('superadmin', 'SuperAdmin'),
    ]

    email      = models.EmailField(unique=True)
    name       = models.CharField(max_length=150)
    phone      = models.CharField(max_length=12, blank=True)
    address    = models.TextField(blank=True)
    role       = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.name
    