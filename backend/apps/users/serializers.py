from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="name",
        source="groups",
    )

    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "roles",
            "permissions",
        ]
        read_only_fields = fields

    def get_permissions(self, obj):
        return sorted(obj.get_all_permissions())