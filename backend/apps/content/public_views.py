from django.utils import timezone
from rest_framework import generics, permissions

from .models import Category, Post
from .public_serializers import (
    PublicCategorySerializer,
    PublicPostSerializer,
)


class PublicPostListView(generics.ListAPIView):
    serializer_class = PublicPostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Post.objects
            .filter(
                status=Post.Status.PUBLISHED,
                published_at__isnull=False,
                published_at__lte=timezone.now(),
            )
            .select_related("featured_image")
            .prefetch_related("categories")
            .order_by("-published_at")
        )


class PublicPostDetailView(generics.RetrieveAPIView):
    serializer_class = PublicPostSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Post.objects
            .filter(
                status=Post.Status.PUBLISHED,
                published_at__isnull=False,
                published_at__lte=timezone.now(),
            )
            .select_related("featured_image")
            .prefetch_related("categories")
        )


class PublicCategoryListView(generics.ListAPIView):
    serializer_class = PublicCategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.filter(
            is_active=True,
        ).order_by("sort_order", "name")
