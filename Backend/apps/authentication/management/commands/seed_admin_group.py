from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create groups and seed superadmins'

    def handle(self, *args, **kwargs):

        # ── groups ───────────────────────────────────────────
        for group_name in ['user', 'admin', 'superadmin']:
            Group.objects.get_or_create(name=group_name)
        self.stdout.write(self.style.SUCCESS('Groups created'))

        if not User.objects.filter(email='superadmin@gmail.com').exists():
            User.objects.create_superuser(
                email='superadmin@gmail.com',
                name='SuperAdmin',
                password='sa1234',
                role = 'superadmin'
            )
            self.stdout.write(self.style.SUCCESS('Superuser created'))
        else:
            self.stdout.write(self.style.WARNING('Superuser already exists'))