from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction, DatabaseError, OperationalError
from .models import Order, OrderItem
from .serializer import OrderSerializer
from apps.userside.cart.models import CartItem
from apps.adminside.products.models import ProductSize
from apps.authentication.permissions import IsAdminOrSuperAdmin


class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            orders = Order.objects.filter(user=request.user).order_by('-created_at')
            return Response(OrderSerializer(orders, many=True).data)
        except DatabaseError:
            return Response({'error': 'Database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            cart_items = CartItem.objects.filter(user=request.user)

            if not cart_items.exists():
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

            address = request.data.get('address')
            phone   = request.data.get('phone')

            if not address:
                return Response({'error': 'Address is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not phone:
                return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not str(phone).isdigit() or len(str(phone)) != 10:
                return Response({'error': 'Phone must be 10 digits'}, status=status.HTTP_400_BAD_REQUEST)

            # Stock check before entering transaction
            for item in cart_items:
                product_size = ProductSize.objects.filter(product=item.product, size=item.size).first()
                if not product_size or product_size.stock < item.quantity:
                    return Response(
                        {'error': f'Not enough stock for {item.product.name} in size {item.size.name}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            with transaction.atomic():
                request.user.address = address
                request.user.phone   = phone
                request.user.save()

                total = sum(item.subtotal for item in cart_items)
                order = Order.objects.create(
                    user=request.user, total_price=total, address=address, phone=phone
                )

                for item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        product=item.product,
                        size=item.size,
                        quantity=item.quantity,
                        price=item.product.price
                    )

                    product_size = ProductSize.objects.filter(product=item.product, size=item.size).first()
                    product_size.stock -= item.quantity
                    product_size.save()

                    item.product.stock = sum(ps.stock for ps in ProductSize.objects.filter(product=item.product))
                    item.product.total_sold += item.quantity
                    item.product.save()

                cart_items.delete()

            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

        except OperationalError:
            return Response({'error': 'Database connection error. Please try again.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except DatabaseError:
            return Response({'error': 'Order could not be placed. All changes have been rolled back.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            order = Order.objects.filter(pk=pk, user=request.user).first()
            if not order:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response(OrderSerializer(order).data)
        except DatabaseError:
            return Response({'error': 'Database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk):
        try:
            order = Order.objects.filter(pk=pk, user=request.user).first()
            if not order:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

            if order.status == 'cancelled':
                return Response({'error': 'Cancelled orders cannot be modified'}, status=status.HTTP_400_BAD_REQUEST)
            if order.status != 'pending':
                return Response({'error': 'Only pending orders can be cancelled'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                for item in order.items.all():
                    product_size = ProductSize.objects.filter(product=item.product, size=item.size).first()
                    if product_size:
                        product_size.stock += item.quantity
                        product_size.save()

                        item.product.stock = sum(ps.stock for ps in ProductSize.objects.filter(product=item.product))
                        item.product.total_sold -= item.quantity
                        item.product.save()

                order.status = 'cancelled'
                order.save()

            return Response(OrderSerializer(order).data)

        except OperationalError:
            return Response({'error': 'Database connection error. Please try again.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except DatabaseError:
            return Response({'error': 'Cancellation failed. All changes have been rolled back.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Admin Order Views ─────────────────────────────────────────────────────────

class AdminOrderListView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        try:
            orders = Order.objects.all().order_by('-created_at')

            # Filter by status
            status_filter = request.query_params.get('status')
            if status_filter:
                orders = orders.filter(status=status_filter)

            # Search by user name
            search = request.query_params.get('search')
            if search:
                orders = orders.filter(user__name__icontains=search)

            return Response(OrderSerializer(orders, many=True).data)
        except DatabaseError:
            return Response({'error': 'Database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminOrderDetailView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request, pk):
        try:
            order = Order.objects.filter(pk=pk).first()
            if not order:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response(OrderSerializer(order).data)
        except DatabaseError:
            return Response({'error': 'Database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk):
        try:
            order = Order.objects.filter(pk=pk).first()
            if not order:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

            if order.status == 'cancelled':
                return Response({'error': 'Cancelled orders cannot be modified'}, status=status.HTTP_400_BAD_REQUEST)

            new_status = request.data.get('status')
            valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

            if not new_status:
                return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
            if new_status not in valid_statuses:
                return Response(
                    {'error': f'Invalid status. Choose from: {", ".join(valid_statuses)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            order.status = new_status
            order.save()
            return Response(OrderSerializer(order).data)

        except DatabaseError:
            return Response({'error': 'Database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)