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
        queryset = (
            Post.objects
            .filter(
                status=Post.Status.PUBLISHED,
                published_at__isnull=False,
                published_at__lte=timezone.now(),
            )
            .select_related("featured_image")
            .prefetch_related("categories")
        )

        search = self.request.query_params.get("search", "").strip()
        if search:
            from django.db.models import Q

            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(excerpt__icontains=search)
                | Q(body__icontains=search)
            )

        category_slug = self.request.query_params.get("category", "").strip()
        if category_slug:
            queryset = queryset.filter(
                categories__slug=category_slug,
                categories__is_active=True,
            )

        ordering = self.request.query_params.get(
            "ordering",
            "-published_at",
        )

        allowed_ordering = {
            "published_at",
            "-published_at",
            "title",
            "-title",
        }

        if ordering not in allowed_ordering:
            ordering = "-published_at"

        return queryset.order_by(ordering, "id").distinct()


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
