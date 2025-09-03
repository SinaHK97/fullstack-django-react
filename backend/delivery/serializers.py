from rest_framework import serializers
from delivery.models import Route, Order
from delivery.enums import OrderStatus


class OrderModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']


class RouteModelSerializer(serializers.ModelSerializer):
    order_count = serializers.IntegerField(read_only=True)
    completion_percentage = serializers.FloatField(read_only=True)
    class Meta:
        model = Route
        fields = '__all__'


class RouteStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['status']

