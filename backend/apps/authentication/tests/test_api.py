from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = "TestPassword123!"
        self.user = User.objects.create_user(
            username="auth_test_user",
            email="auth_test_user@example.com",
            password=self.password,
        )

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {
                "username": self.user.username,
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_invalid_credentials(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {
                "username": self.user.username,
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
        self.assertFalse(response.data["success"])
        self.assertIn("error", response.data)

    def test_refresh_requires_refresh_token(self):
        response = self.client.post(
            "/api/v1/auth/refresh/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("error", response.data)

    def test_logout_blacklists_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access_token}"
        )

        logout_response = self.client.post(
            "/api/v1/auth/logout/",
            {"refresh": refresh_token},
            format="json",
        )

        self.assertEqual(
            logout_response.status_code,
            status.HTTP_200_OK,
        )
        self.assertTrue(logout_response.data["success"])

        refresh_response = self.client.post(
            "/api/v1/auth/refresh/",
            {"refresh": refresh_token},
            format="json",
        )

        self.assertEqual(
            refresh_response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
        self.assertFalse(refresh_response.data["success"])