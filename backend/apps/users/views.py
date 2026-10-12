
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter

from apps.roles.permissions import HasDjangoModelPermission

from .models import User
from .pagination import UserPagination
from .serializers import UserSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)

        return Response({
            "success": True,
            "data": serializer.data,
        })


class UserListView(ListAPIView):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer

    permission_classes = [HasDjangoModelPermission]
    required_permissions = {
        "GET": "users.view_user",
    }

    pagination_class = UserPagination
    filter_backends = [SearchFilter]
    search_fields = [
        "username",
        "email",
        "first_name",
        "last_name",
    ]