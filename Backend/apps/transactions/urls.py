from django.urls import path
from rest_framework.routers import SimpleRouter

from .dashboard_views import DashboardView
from .views import TransactionViewSet

router = SimpleRouter()
router.register("transactions", TransactionViewSet, basename="transaction")

urlpatterns = router.urls + [
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]