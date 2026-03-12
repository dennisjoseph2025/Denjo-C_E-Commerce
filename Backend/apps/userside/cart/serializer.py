from rest_framework import serializers
from .models import CartItem
from apps.adminside.products.models import Product, Size


class CartItemSerializer(serializers.ModelSerializer):
    product      = serializers.SlugRelatedField(queryset=Product.objects.all(), slug_field='name', write_only=True)
    size         = serializers.SlugRelatedField(queryset=Size.objects.all(), slug_field='name')
    subtotal     = serializers.ReadOnlyField()
    product_id   = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price= serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_category = serializers.CharField(source='product.category.name', read_only=True)
    product_image= serializers.SerializerMethodField()

    class Meta:
        model  = CartItem
        fields = ['id', 'product', 'product_id', 'product_name', 'product_category', 'product_price', 'product_image', 'size', 'quantity', 'subtotal', 'added_at']

    def get_product_image(self, obj):
        image = obj.product.images.filter(is_primary=True).first()
        return image.url if image else None