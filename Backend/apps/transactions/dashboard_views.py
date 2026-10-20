from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.dates import month_start, parse_month

from .dashboard import build_dashboard
from .dashboard_serializers import DashboardSerializer


class DashboardView(APIView):
    """Everything the dashboard page needs, in a single request."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                "month", str, description="YYYY-MM. Defaults to the current month."
            )
        ],
        responses=DashboardSerializer,
    )
    def get(self, request):
        raw_month = request.query_params.get("month")
        try:
            month = parse_month(raw_month) if raw_month else month_start(timezone.localdate())
        except ValueError:
            return Response(
                {"month": ["Use the format YYYY-MM, for example 2026-10."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Not a ViewSet: nothing filters by user automatically here, so
        # request.user is passed into every query inside build_dashboard.
        data = build_dashboard(request.user, month)
        return Response(DashboardSerializer(data, context={"request": request}).data)