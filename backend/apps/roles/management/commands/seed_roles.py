from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group


DEFAULT_ROLES = [
    "Admin",
    "Editor",
    "Author",
]


class Command(BaseCommand):
    help = "Create default CMS roles"

    def handle(self, *args, **options):
        for role_name in DEFAULT_ROLES:
            group, created = Group.objects.get_or_create(
                name=role_name
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Role created: {role_name}"
                    )
                )
            else:
                self.stdout.write(
                    f"Role already exists: {role_name}"
                )

        self.stdout.write(
            self.style.SUCCESS(
                "Default roles setup completed."
            )
        )