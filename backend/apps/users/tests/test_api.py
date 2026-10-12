from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.users.models import User


class UserAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="api_test_user",
            email="api_test_user@example.com",
            password="TestPassword123!",
        )

    def test_me_requires_authentication(self):
        response = self.client.get("/api/v1/users/me/")

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_me_returns_authenticated_user(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/v1/users/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(
            response.data["data"]["username"],
            self.user.username,
        )

    def test_user_list_denies_user_without_permission(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/v1/users/")

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_user_list_allows_user_with_view_permission(self):
        from django.contrib.contenttypes.models import ContentType
        from django.contrib.auth.models import Permission

        content_type = ContentType.objects.get_for_model(User)
        permission = Permission.objects.get(
            content_type=content_type,
            codename="view_user",
        )

        self.user.user_permissions.add(permission)
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/v1/users/")

        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["count"], 1)
        self.assertIsNone(response.data["data"]["next"])
        self.assertIsNone(response.data["data"]["previous"])
        self.assertEqual(len(response.data["data"]["results"]), 1)
        self.assertEqual(
            response.data["data"]["results"][0]["username"],
            self.user.username,
        )


    def test_user_list_searches_by_username(self):
        content_type = ContentType.objects.get_for_model(User)
        permission = Permission.objects.get(
            content_type=content_type,
            codename="view_user",
        )
        self.user.user_permissions.add(permission)
        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            "/api/v1/users/",
            {"search": "api_test_user"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["count"], 1)
        self.assertEqual(
            response.data["data"]["results"][0]["username"],
            "api_test_user",
        )

    def test_user_list_pagination(self):
        content_type = ContentType.objects.get_for_model(User)
        permission = Permission.objects.get(
            content_type=content_type,
            codename="view_user",
        )
        self.user.user_permissions.add(permission)

        User.objects.create_user(
            username="api_test_user_2",
            email="api_test_user_2@example.com",
            password="TestPassword123!",
        )

        self.client.force_authenticate(user=self.user)

        first_page = self.client.get(
            "/api/v1/users/",
            {"page_size": 1, "page": 1},
        )

        self.assertEqual(first_page.status_code, status.HTTP_200_OK)
        self.assertEqual(first_page.data["data"]["count"], 2)
        self.assertEqual(len(first_page.data["data"]["results"]), 1)
        self.assertIsNotNone(first_page.data["data"]["next"])
        self.assertIsNone(first_page.data["data"]["previous"])

        second_page = self.client.get(
            "/api/v1/users/",
            {"page_size": 1, "page": 2},
        )

        self.assertEqual(second_page.status_code, status.HTTP_200_OK)
        self.assertEqual(len(second_page.data["data"]["results"]), 1)
        self.assertIsNone(second_page.data["data"]["next"])
        self.assertIsNotNone(second_page.data["data"]["previous"])