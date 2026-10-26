from django.urls import path

from .public_views import (
    PublicCategoryListView,
    PublicPostDetailView,
    PublicPostListView,
)

urlpatterns = [
    path(
        "posts/",
        PublicPostListView.as_view(),
        name="public-post-list",
    ),
    path(
        "posts/<str:slug>/",
        PublicPostDetailView.as_view(),
        name="public-post-detail",
    ),
    path(
        "categories/",
        PublicCategoryListView.as_view(),
        name="public-category-list",
    ),
]
