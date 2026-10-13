from django.db.models import ProtectedError
from rest_framework import status, viewsets
from rest_framework.response import Response

from apps.common.views import OwnedModelViewSetMixin

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(OwnedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None  # a user has a few dozen categories at most
    filterset_fields = ("type", "is_archived")
    search_fields = ("name",)
    ordering_fields = ("name", "created_at")
    ordering = ("type", "name")

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    "detail": "This category has transactions. "
                    "Archive it instead of deleting it."
                },
                status=status.HTTP_409_CONFLICT,
            )