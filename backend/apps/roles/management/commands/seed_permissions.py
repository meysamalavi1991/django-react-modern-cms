from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType

from apps.users.models import User


ROLE_PERMISSIONS = {
    "Admin": [
        "view_user",
        "add_user",
        "change_user",
        "delete_user",
    ],
    "Editor": [
        "view_user",
    ],
    "Author": [],
}


class Command(BaseCommand):
    help = "Assign default user permissions to CMS roles"

    def handle(self, *args, **options):
        content_type = ContentType.objects.get_for_model(User)

        for role_name, codenames in ROLE_PERMISSIONS.items():
            group, _ = Group.objects.get_or_create(name=role_name)

            permissions = Permission.objects.filter(
                content_type=content_type,
                codename__in=codenames,
            )

            found_codenames = set(
                permissions.values_list("codename", flat=True)
            )
            missing = set(codenames) - found_codenames

            if missing:
                self.stderr.write(
                    self.style.ERROR(
                        f"{role_name}: missing permissions: "
                        f"{', '.join(sorted(missing))}"
                    )
                )
                continue

            group.permissions.set(permissions)

            self.stdout.write(
                self.style.SUCCESS(
                    f"{role_name}: {permissions.count()} permissions assigned"
                )
            )