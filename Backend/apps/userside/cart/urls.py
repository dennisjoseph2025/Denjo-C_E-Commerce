from django.urls import path
from .views import CartView, CartItemDetailView

urlpatterns = [
    path('', CartView.as_view()),
    path('<int:pk>/', CartItemDetailView.as_view()),
]