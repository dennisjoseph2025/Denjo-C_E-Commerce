from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Category, SubCategory, Size, Product, ProductImage, ProductSize
from .serializer import CategorySerializer, SubCategorySerializer, SizeSerializer, ProductSerializer, ProductImageSerializer, ProductSizeSerializer
from apps.authentication.permissions import IsAdminOrSuperAdmin, IsSuperAdmin


class ProductPagination(PageNumberPagination):
    page_size             = 12
    page_size_query_param = 'page_size'
    max_page_size         = 100


# ── Category ──────────────────────────────────────────────────
class CategoryListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsSuperAdmin()]   

    def get(self, request):
        try:
            return Response(CategorySerializer(Category.objects.all(), many=True).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = CategorySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── SubCategory ───────────────────────────────────────────────
class SubCategoryListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsSuperAdmin()]       

    def get(self, request):
        try:
            return Response(SubCategorySerializer(SubCategory.objects.all(), many=True).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = SubCategorySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Size ──────────────────────────────────────────────────────
class SizeListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsSuperAdmin()]     

    def get(self, request):
        try:
            return Response(SizeSerializer(Size.objects.all(), many=True).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = SizeSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Product ───────────────────────────────────────────────────
class ProductListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminOrSuperAdmin()]  

    def get(self, request):
        try:
            products = Product.objects.all()

            search = request.query_params.get('search')
            if search:
                products = products.filter(
                    Q(name__icontains=search) |
                    Q(category__name__icontains=search) |
                    Q(subcategory__name__icontains=search)
                )

            category    = request.query_params.get('category')
            subcategory = request.query_params.get('subcategory')
            min_price   = request.query_params.get('min_price')
            max_price   = request.query_params.get('max_price')

            if category:
                products = products.filter(category__name__iexact=category)
            if subcategory:
                products = products.filter(subcategory__name__iexact=subcategory)
            if min_price:
                products = products.filter(price__gte=min_price)
            if max_price:
                products = products.filter(price__lte=max_price)

            paginator  = ProductPagination()
            page       = paginator.paginate_queryset(products, request)
            serializer = ProductSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        except ValueError:
            return Response({'error': 'Invalid price value'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = ProductSerializer(data=request.data)
            if serializer.is_valid():
                images_data = request.data.get('images', [])
                sizes_data  = request.data.get('sizes', [])

                if not images_data:
                    return Response({'error': 'At least one image is required'}, status=status.HTTP_400_BAD_REQUEST)
                if not sizes_data:
                    return Response({'error': 'At least one size is required'}, status=status.HTTP_400_BAD_REQUEST)

                total_stock = sum(s.get('stock', 0) for s in sizes_data)
                product     = serializer.save(stock=total_stock)

                for image in images_data:
                    ProductImage.objects.create(product=product, **image)
                for size in sizes_data:
                    size_obj = Size.objects.filter(name=size['size']).first()
                    if not size_obj:
                        product.delete()
                        return Response({'error': f"Size '{size['size']}' does not exist"}, status=status.HTTP_400_BAD_REQUEST)
                    ProductSize.objects.create(product=product, size=size_obj, stock=size['stock'])

                return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductDetailView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        if self.request.method == 'DELETE':
            return [IsSuperAdmin()]  
        return [IsAdminOrSuperAdmin()]  

    def get(self, request, pk):
        try:
            product = Product.objects.filter(pk=pk).first()
            if not product:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response(ProductSerializer(product).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk):
        try:
            product = Product.objects.filter(pk=pk).first()
            if not product:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                images_data = request.data.get('images', [])
                sizes_data  = request.data.get('sizes', [])

                if sizes_data:
                    total_stock = sum(s.get('stock', 0) for s in sizes_data)
                    product     = serializer.save(stock=total_stock)
                    product.product_sizes.all().delete()
                    for size in sizes_data:
                        size_obj = Size.objects.filter(name=size['size']).first()
                        if not size_obj:
                            return Response({'error': f"Size '{size['size']}' does not exist"}, status=status.HTTP_400_BAD_REQUEST)
                        ProductSize.objects.create(product=product, size=size_obj, stock=size['stock'])
                else:
                    product = serializer.save()

                if images_data:
                    product.images.all().delete()
                    for image in images_data:
                        ProductImage.objects.create(product=product, **image)

                return Response(ProductSerializer(product).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            product = Product.objects.filter(pk=pk).first()
            if not product:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
            product.delete()
            return Response({'message': 'Product deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FeaturedProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            products = Product.objects.filter(is_featured=True, is_active=True)
            return Response(ProductSerializer(products, many=True).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BestsellerProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            products = Product.objects.filter(is_bestseller=True, is_active=True)
            return Response(ProductSerializer(products, many=True).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)