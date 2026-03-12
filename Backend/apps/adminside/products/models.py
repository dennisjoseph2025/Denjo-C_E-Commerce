from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Category(models.Model):
    name        = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'


class SubCategory(models.Model):
    category    = models.ForeignKey( Category,on_delete=models.CASCADE, related_name='subcategories')
    name        = models.CharField(max_length=100)
    
    def __str__(self):
        return f'{self.category.name} → {self.name}'

    class Meta:
        verbose_name_plural = 'SubCategories'


class Size(models.Model):
    name = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'sizes'


class Product(models.Model):
    category      = models.ForeignKey(Category, on_delete=models.SET_NULL,null=True, blank=True,related_name='products')
    subcategory   = models.ForeignKey(SubCategory,on_delete=models.SET_NULL, null=True, blank=True,related_name='products')
    sizes         = models.ManyToManyField(Size,through='ProductSize',related_name='products')
    name          = models.CharField(max_length=100)
    description   = models.TextField()
    price         = models.DecimalField(max_digits=10, decimal_places=2)
    stock         = models.PositiveIntegerField(default=0) 
    is_featured   = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    total_sold    = models.PositiveIntegerField(default=0)
    is_active     = models.BooleanField(default=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.name

    @property
    def is_in_stock(self):
        return self.stock > 0

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']


class ProductSize(models.Model):
    product = models.ForeignKey(Product,on_delete=models.CASCADE, related_name='product_sizes')
    size    = models.ForeignKey(Size, on_delete=models.CASCADE, related_name='product_sizes')
    stock   = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'{self.product.name} - {self.size.name} ({self.stock})'

    class Meta:
        db_table        = 'product_sizes'
        unique_together = ('product', 'size')


class ProductImage(models.Model):
    product    = models.ForeignKey(Product,on_delete=models.CASCADE,related_name='images')
    url        = models.URLField(max_length=500)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.product.name} - image'

    class Meta:
        db_table = 'product_images'


@receiver(post_save, sender=Product)
def update_product_status(sender, instance, created, **kwargs):
    if not created:
        if instance.stock == 0 and instance.is_active:
            Product.objects.filter(pk=instance.pk).update(is_active=False)
        elif instance.stock > 0 and not instance.is_active:
            Product.objects.filter(pk=instance.pk).update(is_active=True)
