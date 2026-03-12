from django.urls import path
from .views import AdminUserListView,AdminStaffListView,AdminUserDetailView,AdminToggleBlockUserView,AdminToggleBlockStaffView,AdminPromoteUserView,AdminDemoteStaffView,AdminDeleteStaffView


urlpatterns = [
    # Both admin + superadmin
    path('users/',AdminUserListView.as_view()),
    path('staff/',AdminStaffListView.as_view()),
    path('users/<int:pk>/',AdminUserDetailView.as_view()),
    path('users/<int:pk>/block/',AdminToggleBlockUserView.as_view()),

    # Superadmin only
    path('users/<int:pk>/promote/',AdminPromoteUserView.as_view()),
    path('staff/<int:pk>/',AdminDeleteStaffView.as_view()),
    path('staff/<int:pk>/block/',AdminToggleBlockStaffView.as_view()),
    path('staff/<int:pk>/demote/',AdminDemoteStaffView.as_view()),
]