from django.contrib import admin
from .models import CartItem


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display  = ['user', 'product', 'size', 'quantity', 'subtotal', 'added_at']
    list_filter   = ['size', 'added_at']
    search_fields = ['user__name', 'user__email', 'product__name']
    ordering      = ['-added_at']