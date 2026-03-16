from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializer import RegistrationSerializer, UserProfileSerializer, UpdateProfileSerializer


class RegisterView(APIView):
    def post(self, request):
        try:
            postserializer = RegistrationSerializer(data=request.data)
            if postserializer.is_valid():
                user = postserializer.save()
                refresh = RefreshToken.for_user(user)
                return Response({
                    'token': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token)
                    },
                    'data': UserProfileSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            return Response({'data': postserializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e) + ' RegisterView post'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            return Response(UserProfileSerializer(request.user).data)
        except Exception as e:
            return Response({'error': str(e) + ' UserProfileView get'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request):
        try:
            serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(UserProfileSerializer(request.user).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e) + ' UserProfileView patch'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e) + ' LogoutView post'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)