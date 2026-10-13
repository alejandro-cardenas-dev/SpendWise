import django_filters

from apps.categories.models import Category

from .models import Transaction


class TransactionFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name="category_id")
    type = django_filters.ChoiceFilter(
        field_name="category__type", choices=Category.Type.choices
    )
    date_from = django_filters.DateFilter(field_name="date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="date", lookup_expr="lte")
    min_amount = django_filters.NumberFilter(field_name="amount", lookup_expr="gte")
    max_amount = django_filters.NumberFilter(field_name="amount", lookup_expr="lte")

    class Meta:
        model = Transaction
        fields = []  # everything is declared explicitly above