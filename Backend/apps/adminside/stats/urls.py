from django.urls import path
from .views import CompanyStatsView

urlpatterns = [
    path('', CompanyStatsView.as_view()),
]