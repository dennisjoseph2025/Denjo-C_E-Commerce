import json
import os
from django.core.management.base import BaseCommand
from apps.adminside.products.models import Category, SubCategory, Size, Product, ProductImage, ProductSize


class Command(BaseCommand):
    help = 'Seed the database with product data from product_seed_data.json'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Load JSON file
        json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'product_seed_data.json')
        with open(json_path, 'r') as f:
            data = json.load(f)

        # ── Categories ────────────────────────────────────────
        for name in data['categories']:
            Category.objects.get_or_create(name=name)
            self.stdout.write(f'  ✔ Category: {name}')

        # ── SubCategories ─────────────────────────────────────
        for sub in data['subcategories']:
            category = Category.objects.filter(name=sub['category']).first()
            SubCategory.objects.get_or_create(name=sub['name'], category=category)
            self.stdout.write(f'  ✔ SubCategory: {sub["name"]}')

        # ── Sizes ─────────────────────────────────────────────
        for name in data['sizes']:
            Size.objects.get_or_create(name=name)
            self.stdout.write(f'  ✔ Size: {name}')

        # ── Products ──────────────────────────────────────────
        self.stdout.write('\nCreating products...')
        for p in data['products']:
            category    = Category.objects.filter(name=p['category']).first()
            subcategory = SubCategory.objects.filter(name=p['subcategory']).first()
            total_stock = sum(p['sizes'].values())

            product, created = Product.objects.get_or_create(
                name=p['name'],
                defaults={
                    'description':   p['description'],
                    'price':         p['price'],
                    'category':      category,
                    'subcategory':   subcategory,
                    'is_featured':   p['is_featured'],
                    'is_bestseller': p['is_bestseller'],
                    'stock':         total_stock,
                }
            )

            if created:
                for img in p['images']:
                    ProductImage.objects.create(product=product, **img)

                for size_name, stock in p['sizes'].items():
                    size_obj = Size.objects.filter(name=size_name).first()
                    if size_obj:
                        ProductSize.objects.create(product=product, size=size_obj, stock=stock)

                self.stdout.write(f'  ✔ Created: {product.name}')
            else:
                self.stdout.write(f'  – Skipped (exists): {product.name}')

        self.stdout.write(self.style.SUCCESS('\nSeeding complete! 15 products loaded.'))