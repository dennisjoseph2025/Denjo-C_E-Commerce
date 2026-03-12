from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import User


class RegistrationSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['id', 'name', 'phone', 'email', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords must match'})
        return data

    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('Phone must contain only digits')
        if len(value) != 10:
            raise serializers.ValidationError('Phone must be 10 digits')
        return value

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        try:
            group = Group.objects.get(name=user.role)
            user.groups.add(group)
        except Group.DoesNotExist:
            pass
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'name', 'email', 'phone', 'address', 'role', 'created_at']


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['name', 'phone', 'address']

    def validate_phone(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError('Phone must contain only digits')
        if value and len(value) != 10:
            raise serializers.ValidationError('Phone must be 10 digits')
        return value