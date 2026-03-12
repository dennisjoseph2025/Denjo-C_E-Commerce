from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('admin/',              admin.site.urls),
    path('auth/',               include('apps.authentication.urls')),
    path('api/products/',       include('apps.adminside.products.urls')),
    path('api/cart/',           include('apps.userside.cart.urls')),
    path('api/order/',          include('apps.userside.order.urls')),
    path('api/admin/stats/',    include('apps.adminside.stats.urls')), 
    path('api/admin/',          include('apps.adminside.users.urls')),
    
    # Swagger UI:
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
