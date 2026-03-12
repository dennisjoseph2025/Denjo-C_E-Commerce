from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from apps.authentication.permissions import IsAdminOrSuperAdmin
from apps.authentication.models import User
from apps.userside.order.models import Order
from apps.adminside.products.models import Product


class CompanyStatsView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        try:
            orders = Order.objects.all()

            # Order counts by status
            pending_orders    = orders.filter(status='pending').count()
            confirmed_orders  = orders.filter(status='confirmed').count()
            shipped_orders    = orders.filter(status='shipped').count()
            delivered_orders  = orders.filter(status='delivered').count()
            cancelled_orders  = orders.filter(status='cancelled').count()

            # Revenue — only confirmed, shipped, delivered
            total_revenue     = orders.filter(status__in=['confirmed', 'shipped', 'delivered']).aggregate(total=Sum('total_price'))['total'] or 0
            confirmed_revenue = orders.filter(status='confirmed').aggregate(total=Sum('total_price'))['total'] or 0
            shipped_revenue   = orders.filter(status='shipped').aggregate(total=Sum('total_price'))['total'] or 0
            delivered_revenue = orders.filter(status='delivered').aggregate(total=Sum('total_price'))['total'] or 0

            # Products
            total_products      = Product.objects.count()
            active_products     = Product.objects.filter(is_active=True).count()
            out_of_stock        = Product.objects.filter(is_active=False).count()
            featured_products   = Product.objects.filter(is_featured=True).count()
            bestseller_products = Product.objects.filter(is_bestseller=True).count()

            # Users
            total_users   = User.objects.filter(role='user').count()
            active_users  = User.objects.filter(role='user', is_active=True).count()
            blocked_users = User.objects.filter(role='user', is_active=False).count()

            return Response({
                'orders': {
                    'total':     orders.count(),
                    'pending':   pending_orders,
                    'confirmed': confirmed_orders,
                    'shipped':   shipped_orders,
                    'delivered': delivered_orders,
                    'cancelled': cancelled_orders,
                },
                'revenue': {
                    'total':     total_revenue,
                    'confirmed': confirmed_revenue,
                    'shipped':   shipped_revenue,
                    'delivered': delivered_revenue,
                },
                'products': {
                    'total':        total_products,
                    'active':       active_products,
                    'out_of_stock': out_of_stock,
                    'featured':     featured_products,
                    'bestsellers':  bestseller_products,
                },
                'users': {
                    'total':   total_users,
                    'active':  active_users,
                    'blocked': blocked_users,
                },
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)