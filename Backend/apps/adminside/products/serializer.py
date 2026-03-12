from rest_framework import serializers
from .models import Category, Size, SubCategory, Product, ProductImage, ProductSize


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name']


class SubCategorySerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        queryset=Category.objects.all(),
        slug_field='name'
    )

    class Meta:
        model  = SubCategory
        fields = ['id', 'name', 'category']


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Size
        fields = ['id', 'name']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductImage
        fields = ['id', 'url', 'is_primary']


class ProductSizeSerializer(serializers.ModelSerializer):
    size = serializers.SlugRelatedField(queryset=Size.objects.all(), slug_field='name')

    class Meta:
        model  = ProductSize
        fields = ['id', 'size', 'stock']


class ProductSerializer(serializers.ModelSerializer):
    category    = serializers.SlugRelatedField(queryset=Category.objects.all(), slug_field='name')
    subcategory = serializers.SlugRelatedField(queryset=SubCategory.objects.all(), slug_field='name')
    images      = ProductImageSerializer(many=True, read_only=True)
    sizes       = ProductSizeSerializer(many=True, read_only=True, source='product_sizes')
    stock       = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock',
            'is_active', 'is_featured', 'is_bestseller', 'total_sold',
            'category', 'subcategory', 'sizes', 'images', 'created_at'
        ]

    def validate(self, data):
        request = self.context.get('request')
        if request and request.method == 'POST':
            images = request.data.get('images', [])
            sizes  = request.data.get('sizes', [])
            if not images:
                raise serializers.ValidationError({'images': 'At least one image is required.'})
            if not sizes:
                raise serializers.ValidationError({'sizes': 'At least one size is required.'})
        return data