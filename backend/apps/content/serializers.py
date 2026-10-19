from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.media.models import MediaFile

from .models import Category, Post


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "parent",
            "is_active",
            "sort_order",
            "children",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_children(self, obj):
        children = obj.children.all()
        return CategorySerializer(children, many=True, context=self.context).data

    def validate_parent(self, parent):
        if parent is None:
            return parent

        instance = getattr(self, "instance", None)

        if instance and parent.pk == instance.pk:
            raise serializers.ValidationError(
                "یک دسته‌بندی نمی‌تواند والد خودش باشد."
            )

        ancestor = parent
        visited = set()

        while ancestor:
            if ancestor.pk in visited:
                raise serializers.ValidationError(
                    "ساختار درختی فعلی دارای چرخه است."
                )

            visited.add(ancestor.pk)

            if instance and ancestor.pk == instance.pk:
                raise serializers.ValidationError(
                    "نمی‌توان یک دسته‌بندی را زیرمجموعه خودش قرار داد."
                )

            ancestor = ancestor.parent

        return parent

    def create(self, validated_data):
        instance = Category(**validated_data)
        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        instance.save()
        return instance


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(
        source="author.username",
        read_only=True,
    )
    featured_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "body",
            "author",
            "author_username",
            "categories",
            "featured_image",
            "featured_image_url",
            "status",
            "published_at",
            "meta_title",
            "meta_description",
            "focus_keyword",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "author",
            "author_username",
            "created_at",
            "updated_at",
        ]

    def get_featured_image_url(self, obj):
        if not obj.featured_image or not obj.featured_image.file:
            return None

        request = self.context.get("request")
        url = obj.featured_image.file.url

        return request.build_absolute_uri(url) if request else url

    def validate_featured_image(self, media):
        if media and media.media_type != MediaFile.MediaType.IMAGE:
            raise serializers.ValidationError(
                "تصویر شاخص باید از نوع تصویر باشد."
            )
        return media

    def validate(self, attrs):
        status = attrs.get(
            "status",
            getattr(self.instance, "status", Post.Status.DRAFT),
        )
        published_at = attrs.get(
            "published_at",
            getattr(self.instance, "published_at", None),
        )

        if status == Post.Status.PUBLISHED and published_at is None:
            from django.utils import timezone
            attrs["published_at"] = timezone.now()

        return attrs
