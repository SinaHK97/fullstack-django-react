from django.urls import path
from delivery.views import (
    RouteDetailView,
    RouteListView,
    RouteStatusUpdateView,
    OrderDetailView,
    OrderStatusUpdateView,
    RouteOrderListView,
    RouteExportCSVView,
    # RouteExportPDFView,
)

urlpatterns = [
    path('routes', RouteListView.as_view(), name='route-list'),
    path('routes/<int:pk>', RouteDetailView.as_view(), name='route-detail'),
    path('routes/<int:pk>/orders', RouteOrderListView.as_view(), name='route-orders'),
    path('routes/<int:pk>/status', RouteStatusUpdateView.as_view(), name='route-status-update'),
    path('routes/export.csv', RouteExportCSVView.as_view(), name='route-export-csv'),
    # path('routes/export.pdf', RouteExportPDFView.as_view(), name='route-export-pdf'),
    path('orders/<int:pk>', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/status', OrderStatusUpdateView.as_view(), name='order-status-update'),
]
