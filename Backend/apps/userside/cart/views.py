from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import CartItem
from .serializer import CartItemSerializer


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            items      = CartItem.objects.filter(user=request.user)
            serializer = CartItemSerializer(items, many=True)
            total      = sum(item.subtotal for item in items)
            return Response({'items': serializer.data, 'total': total})
        except Exception as e:
            return Response({'error': str(e) + ' CartView get'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = CartItemSerializer(data=request.data)
            if serializer.is_valid():
                product  = serializer.validated_data['product']
                size     = serializer.validated_data['size']
                quantity = serializer.validated_data.get('quantity', 1)

                item, created = CartItem.objects.get_or_create(
                    user=request.user,
                    product=product,
                    size=size,
                    defaults={'quantity': quantity}
                )

                if not created:
                    item.quantity += quantity
                    item.save()

                return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e) + ' CartView post'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        try:
            CartItem.objects.filter(user=request.user).delete()
            return Response({'message': 'Cart cleared'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e) + ' CartView delete'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            item = CartItem.objects.filter(pk=pk, user=request.user).first()
            if not item:
                return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

            quantity = request.data.get('quantity')
            if not quantity or int(quantity) < 1:
                return Response({'error': 'Quantity must be at least 1'}, status=status.HTTP_400_BAD_REQUEST)

            item.quantity = int(quantity)
            item.save()
            return Response(CartItemSerializer(item).data)
        except Exception as e:
            return Response({'error': str(e) + ' CartItemDetailView patch'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            item = CartItem.objects.filter(pk=pk, user=request.user).first()
            if not item:
                return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
            item.delete()
            return Response({'message': 'Item removed'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e) + ' CartItemDetailView delete'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)