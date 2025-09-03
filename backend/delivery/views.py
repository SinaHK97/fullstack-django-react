
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from delivery.serializers import (
    RouteModelSerializer,
    RouteStatusUpdateSerializer,
    OrderModelSerializer,
    OrderStatusUpdateSerializer
)
from delivery.models import Route, Order
from delivery.services import (
    search_routes,
    search_orders,
    export_routes_to_csv,
)
from django.db.models import Count, Q, F, Case, When, FloatField, Value


class RouteListView(generics.ListAPIView):
    serializer_class = RouteModelSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        queryset = Route.objects.all().annotate(
            order_count=Count('orders'),
            delivered_count=Count('orders', filter=Q(orders__status='DELIVERED')),
        ).annotate(
            completion_percentage=Case(
                When(order_count=0, then=Value(0.0)),
                default=(F('delivered_count') * 100.0) / F('order_count'),
                output_field=FloatField(),
            )
        )
        search = self.request.query_params.get('search')
        if search: return search_routes(search, queryset)
        return queryset.order_by('-updated_at')
    

class RouteDetailView(generics.RetrieveAPIView):
    queryset = Route.objects.all().annotate(
        order_count=Count('orders'),
        delivered_count=Count('orders', filter=Q(orders__status='DELIVERED')),
    ).annotate(
        completion_percentage=Case(
            When(order_count=0, then=Value(0.0)),
            default=(F('delivered_count') * 100.0) / F('order_count'),
            output_field=FloatField(),
        )
    )
    serializer_class = RouteModelSerializer


class RouteStatusUpdateView(generics.UpdateAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteStatusUpdateSerializer


class RouteOrderListView(generics.ListAPIView):
    serializer_class = OrderModelSerializer

    def get_queryset(self):
        route_id = self.kwargs.get('pk')
        queryset = Order.objects.filter(route_id=route_id)
        search = self.request.query_params.get('search', None)
        if search: return search_orders(search, queryset)
        return queryset.order_by('-updated_at')


class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderModelSerializer


class OrderStatusUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderStatusUpdateSerializer


class RouteExportCSVView(APIView):
    def get(self, request):
        q = request.query_params.get('q')
        routes = search_routes(q) if q else Route.objects.all()
        filename, content = export_routes_to_csv(routes)
        response = HttpResponse(content, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
