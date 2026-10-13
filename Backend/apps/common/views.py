from rest_framework.permissions import IsAuthenticated

from .permissions import IsOwner


class OwnedModelViewSetMixin:
    """Scope a ModelViewSet to the authenticated user.

    - Every query is filtered by request.user, so users never see each
    other's data.
    - The owner is set on create from the request, never from the payload.

    Put it BEFORE ModelViewSet in the class bases.
    """

    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        queryset = super().get_queryset()
        # drf-spectacular builds the schema without a real user
        if getattr(self, "swagger_fake_view", False):
            return queryset.none()
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)