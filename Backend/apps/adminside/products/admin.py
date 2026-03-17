from django.contrib import admin
from .models import Category, SubCategory, Size, Product, ProductSize, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name']
    search_fields = ['name']


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'category']
    search_fields = ['name']
    list_filter   = ['category']


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display  = ['name']
    search_fields = ['name']


class ProductSizeInline(admin.TabularInline): 
    model = ProductSize
    extra = 1                   


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ['name', 'category', 'subcategory', 'price', 'stock', 'is_active', 'is_featured', 'is_bestseller']
    list_filter   = ['is_active', 'is_featured', 'is_bestseller', 'category']
    search_fields = ['name']
    inlines       = [ProductSizeInline, ProductImageInline]  