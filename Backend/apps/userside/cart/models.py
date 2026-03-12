from django.db import models
from apps.authentication.models import User
from apps.adminside.products.models import Product, Size


class CartItem(models.Model):
    user     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product  = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    size     = models.ForeignKey(Size, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.name} - {self.product.name} ({self.size.name}) x{self.quantity}'

    @property
    def subtotal(self):
        return self.product.price * self.quantity

    class Meta:
        db_table        = 'cart_items'
        unique_together = ('user', 'product', 'size')