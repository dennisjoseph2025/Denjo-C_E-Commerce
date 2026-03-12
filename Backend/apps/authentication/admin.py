from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ['name', 'email', 'role', 'is_active', 'is_staff', 'created_at']
    list_filter   = ['role', 'is_active', 'is_staff']
    search_fields = ['email', 'name']
    ordering      = ['-created_at']

    fieldsets = (
        ('Login Info',   {'fields': ('email', 'password')}),
        ('Personal Info',{'fields': ('name', 'phone', 'address')}),
        ('Role',         {'fields': ('role',)}),
        ('Permissions',  {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields' : ('email', 'name', 'password1', 'password2', 'role'),
        }),
    )
