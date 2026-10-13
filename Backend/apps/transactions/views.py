from rest_framework import viewsets

from apps.common.views import OwnedModelViewSetMixin

from .filters import TransactionFilter
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(OwnedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related("category")  # avoids N+1 queries
    serializer_class = TransactionSerializer
    filterset_class = TransactionFilter
    search_fields = ("description", "category__name")
    ordering_fields = ("date", "amount", "created_at")
    ordering = ("-date", "-id")