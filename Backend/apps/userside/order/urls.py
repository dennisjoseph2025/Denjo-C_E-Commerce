from django.urls import path
from .views import OrderView, OrderDetailView, AdminOrderListView, AdminOrderDetailView

urlpatterns = [
    # User
    path('',          OrderView.as_view()),
    path('<int:pk>/', OrderDetailView.as_view()),

    # Admin
    path('admin/',          AdminOrderListView.as_view()),
    path('admin/<int:pk>/', AdminOrderDetailView.as_view()),
]