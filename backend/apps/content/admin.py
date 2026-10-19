from django.contrib import admin

from .models import Category, Post


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "parent",
        "is_active",
        "sort_order",
        "updated_at",
    )
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "description")
    ordering = ("sort_order", "name")
    list_per_page = 25
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "author",
        "status",
        "published_at",
        "updated_at",
    )
    list_filter = ("status", "categories", "created_at")
    search_fields = (
        "title",
        "slug",
        "excerpt",
        "body",
        "meta_title",
    )
    filter_horizontal = ("categories",)
    list_select_related = ("author", "featured_image")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    list_per_page = 25
    prepopulated_fields = {"slug": ("title",)}
