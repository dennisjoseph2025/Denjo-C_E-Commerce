from django.urls import path
from .views import CategoryListView,SubCategoryListView,SizeListView,ProductListView, ProductDetailView, FeaturedProductsView, BestsellerProductsView

urlpatterns = [
    # category
    path('categories/',CategoryListView.as_view()),

    # subcategory
    path('subcategories/',SubCategoryListView.as_view()),

    # size
    path('sizes/',SizeListView.as_view()),

    # product
    path('', ProductListView.as_view()),
    path('<int:pk>/',ProductDetailView.as_view()),
    
    path('featured/',     FeaturedProductsView.as_view()),
    path('bestsellers/',  BestsellerProductsView.as_view()),
]