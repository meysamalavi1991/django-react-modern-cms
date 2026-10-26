from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.content.models import Category, Post


class PublicPostAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        User = get_user_model()

        cls.author = User.objects.create_user(
            username="public-api-author",
            email="public-api-author@example.com",
            password="Test-password-123",
        )

        cls.active_category = Category.objects.create(
            name="Technology",
            is_active=True,
        )
        cls.inactive_category = Category.objects.create(
            name="Hidden Category",
            is_active=False,
        )

    def create_post(self, title, status, published_at=None):
        return Post.objects.create(
            title=title,
            author=self.author,
            status=status,
            published_at=published_at,
            body=f"Body of {title}",
        )

    def test_post_list_is_public_and_only_returns_published_posts(self):
        now = timezone.now()

        published_post = self.create_post(
            "Published Post",
            Post.Status.PUBLISHED,
            now - timedelta(minutes=5),
        )
        published_post.categories.add(
            self.active_category,
            self.inactive_category,
        )

        self.create_post(
            "Draft Post",
            Post.Status.DRAFT,
            now - timedelta(minutes=5),
        )
        self.create_post(
            "Archived Post",
            Post.Status.ARCHIVED,
            now - timedelta(minutes=5),
        )
        self.create_post(
            "Future Post",
            Post.Status.PUBLISHED,
            now + timedelta(days=1),
        )
        self.create_post(
            "Missing Publication Date",
            Post.Status.PUBLISHED,
            None,
        )

        response = self.client.get(reverse("public-post-list"))

        self.assertEqual(response.status_code, 200)

        returned_slugs = [
            item["slug"] for item in response.data["results"]
        ]

        self.assertEqual(returned_slugs, [published_post.slug])

        returned_post = response.data["results"][0]
        returned_category_slugs = [
            category["slug"] for category in returned_post["categories"]
        ]

        self.assertEqual(
            returned_category_slugs,
            [self.active_category.slug],
        )

    def test_public_post_detail_returns_published_post(self):
        post = self.create_post(
            "Public Detail Post",
            Post.Status.PUBLISHED,
            timezone.now() - timedelta(minutes=1),
        )

        response = self.client.get(
            reverse(
                "public-post-detail",
                kwargs={"slug": post.slug},
            )
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["slug"], post.slug)

    def test_public_post_detail_hides_draft_post(self):
        post = self.create_post(
            "Private Draft",
            Post.Status.DRAFT,
            timezone.now() - timedelta(minutes=1),
        )

        response = self.client.get(
            reverse(
                "public-post-detail",
                kwargs={"slug": post.slug},
            )
        )

        self.assertEqual(response.status_code, 404)

    def test_public_categories_only_returns_active_categories(self):
        response = self.client.get(reverse("public-category-list"))

        self.assertEqual(response.status_code, 200)

        returned_slugs = [
            item["slug"] for item in response.data["results"]
        ]

        self.assertIn(self.active_category.slug, returned_slugs)
        self.assertNotIn(self.inactive_category.slug, returned_slugs)
