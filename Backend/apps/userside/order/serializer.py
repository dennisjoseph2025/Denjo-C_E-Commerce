from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    size              = serializers.StringRelatedField()
    product_id        = serializers.IntegerField(source='product.id', read_only=True)
    product_name      = serializers.CharField(source='product.name', read_only=True)
    product_category  = serializers.CharField(source='product.category.name', read_only=True)
    product_image     = serializers.SerializerMethodField()

    class Meta:
        model  = OrderItem
        fields = ['id', 'product_id', 'product_name', 'product_category', 'product_image', 'size', 'quantity', 'price']

    def get_product_image(self, obj):
        if not obj.product:
            return None
        image = obj.product.images.filter(is_primary=True).first()
        return image.url if image else None


class OrderSerializer(serializers.ModelSerializer):
    items      = OrderItemSerializer(many=True, read_only=True)
    user_name  = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model  = Order
        fields = ['id', 'user_name', 'user_email', 'status', 'total_price', 'address', 'phone', 'items', 'created_at']