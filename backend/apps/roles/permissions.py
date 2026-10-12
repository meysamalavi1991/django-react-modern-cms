from rest_framework.permissions import BasePermission

class HasDjangoModelPermission(BasePermission):
    """
        Check Django model permissions for the requested action.
    """

    def has_permission(self, request, view):
        permission_map = getattr(view, "required_permissions", {})

        permission = permission_map.get(request.method)

        if not permission:
            return False

        return request.user.has_perm(permission)
