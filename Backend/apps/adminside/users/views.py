from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from apps.authentication.models import User
from apps.authentication.serializer import UserProfileSerializer
from apps.authentication.permissions import IsAdminOrSuperAdmin, IsSuperAdmin


class UserPagination(PageNumberPagination):
    page_size             = 10
    page_size_query_param = 'page_size'
    max_page_size         = 100


class AdminUserListView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        try:
            users = User.objects.filter(role='user').order_by('-id')

            search = request.query_params.get('search')
            if search:
                users = users.filter(name__icontains=search)

            is_active = request.query_params.get('is_active')
            if is_active is not None:
                users = users.filter(is_active=is_active.lower() == 'true')

            paginator  = UserPagination()
            page       = paginator.paginate_queryset(users, request)
            serializer = UserProfileSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminStaffListView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        try:
            staff = User.objects.filter(role__in=['admin', 'superadmin']).order_by('-id')

            search = request.query_params.get('search')
            if search:
                staff = staff.filter(name__icontains=search)

            role = request.query_params.get('role')
            if role:
                staff = staff.filter(role=role)

            paginator  = UserPagination()
            page       = paginator.paginate_queryset(staff, request)
            serializer = UserProfileSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request, pk):
        try:
            user = User.objects.filter(pk=pk, role='user').first()
            if not user:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response(UserProfileSerializer(user).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            user = User.objects.filter(pk=pk, role='user').first()
            if not user:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            user.delete()
            return Response({'message': 'User deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminToggleBlockUserView(APIView):
    # Block or unblock a regular user
    permission_classes = [IsAdminOrSuperAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.filter(pk=pk, role='user').first()
            if not user:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            user.is_active = not user.is_active
            user.save()

            state = 'unblocked' if user.is_active else 'blocked'
            return Response({'message': f'User {state} successfully', 'is_active': user.is_active})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminToggleBlockStaffView(APIView):
    # Block or unblock an admin — superadmin only
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        try:
            staff = User.objects.filter(pk=pk, role='admin').first()
            if not staff:
                return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)

            staff.is_active = not staff.is_active
            staff.save()

            state = 'unblocked' if staff.is_active else 'blocked'
            return Response({'message': f'Admin {state} successfully', 'is_active': staff.is_active})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminPromoteUserView(APIView):
    # Promote a regular user to admin — superadmin only
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.filter(pk=pk, role='user').first()
            if not user:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            user.role = 'admin'
            user.save()
            return Response({'message': f'{user.name} has been promoted to admin', 'role': user.role})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminDemoteStaffView(APIView):
    # Demote an admin back to regular user — superadmin only
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        try:
            staff = User.objects.filter(pk=pk, role='admin').first()
            if not staff:
                return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)

            staff.role = 'user'
            staff.save()
            return Response({'message': f'{staff.name} has been demoted to user', 'role': staff.role})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminDeleteStaffView(APIView):
    # Delete an admin account — superadmin only
    permission_classes = [IsSuperAdmin]

    def delete(self, request, pk):
        try:
            staff = User.objects.filter(pk=pk, role='admin').first()
            if not staff:
                return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)

            staff.delete()
            return Response({'message': 'Admin deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)