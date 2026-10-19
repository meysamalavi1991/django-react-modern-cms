from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Category, Post
from .serializers import CategorySerializer, PostSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug", "description"]
    ordering_fields = ["name", "sort_order", "created_at"]
    ordering = ["sort_order", "name"]

    def get_queryset(self):
        queryset = Category.objects.prefetch_related("children")

        active = self.request.query_params.get("active")
        if active == "true":
            queryset = queryset.filter(is_active=True)
        elif active == "false":
            queryset = queryset.filter(is_active=False)

        parent = self.request.query_params.get("parent")
        if parent == "null":
            queryset = queryset.filter(parent__isnull=True)
        elif parent:
            queryset = queryset.filter(parent_id=parent)

        return queryset

    @action(detail=False, methods=["get"])
    def tree(self, request):
        roots = self.get_queryset().filter(parent__isnull=True)
        serializer = self.get_serializer(roots, many=True)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        if not (
            self.request.user.is_staff
            or self.request.user.is_superuser
        ):
            raise PermissionDenied(
                "فقط مدیر سیستم اجازه حذف دسته‌بندی را دارد."
            )

        instance.delete()


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "slug", "excerpt", "body"]
    ordering_fields = ["created_at", "updated_at", "published_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = (
            Post.objects
            .select_related("author", "featured_image")
            .prefetch_related("categories")
        )

        status = self.request.query_params.get("status")
        if status in Post.Status.values:
            queryset = queryset.filter(status=status)

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(categories__id=category)

        return queryset.distinct()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        post = self.get_object()

        if not (
            self.request.user.is_staff
            or self.request.user.is_superuser
            or post.author_id == self.request.user.id
        ):
            raise PermissionDenied(
                "شما اجازه ویرایش این مقاله را ندارید."
            )

        serializer.save()

    def perform_destroy(self, instance):
        if not (
            self.request.user.is_staff
            or self.request.user.is_superuser
            or instance.author_id == self.request.user.id
        ):
            raise PermissionDenied(
                "شما اجازه حذف این مقاله را ندارید."
            )

        instance.delete()
