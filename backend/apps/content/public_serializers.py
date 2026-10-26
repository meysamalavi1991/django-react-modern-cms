from rest_framework import serializers

from apps.media.models import MediaFile
from .models import Category, Post


class PublicCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "name",
            "slug",
        ]


class PublicPostSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()
    featured_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "title",
            "slug",
            "excerpt",
            "body",
            "published_at",
            "meta_title",
            "meta_description",
            "featured_image_url",
            "categories",
        ]

    def get_featured_image_url(self, obj):
        if not obj.featured_image or not obj.featured_image.file:
            return None

        request = self.context.get("request")
        url = obj.featured_image.file.url

        if request:
            return request.build_absolute_uri(url)

        return url

    def get_categories(self, obj):
        active_categories = obj.categories.filter(is_active=True)

        return PublicCategorySerializer(
            active_categories,
            many=True,
            context=self.context,
        ).data
