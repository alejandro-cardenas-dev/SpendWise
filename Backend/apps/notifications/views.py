from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import mixins, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.views import OwnedModelViewSetMixin

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(
    OwnedModelViewSetMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Read-only: notifications are created by the system, never by clients."""

    queryset = Notification.objects.select_related("category")
    serializer_class = NotificationSerializer
    filterset_fields = ("is_read", "type")
    ordering_fields = ("created_at",)
    ordering = ("-created_at", "-id")

    @extend_schema(request=None, responses=NotificationSerializer)
    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        """Mark one notification as read."""
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])
        return Response(self.get_serializer(notification).data)

    @extend_schema(
        request=None,
        responses=inline_serializer(
            "MarkAllReadResponse", {"updated": serializers.IntegerField()}
        ),
    )
    @action(detail=False, methods=["post"], url_path="read-all")
    def read_all(self, request):
        """Mark every unread notification of the current user as read."""
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"updated": updated})

    @extend_schema(
        responses=inline_serializer(
            "UnreadCountResponse", {"count": serializers.IntegerField()}
        )
    )
    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        """Cheap endpoint for the navbar badge (polled every 30 s)."""
        return Response({"count": self.get_queryset().filter(is_read=False).count()})