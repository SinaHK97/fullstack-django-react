from django.db import models
from delivery.enums import RouteStatus, OrderStatus

class Route(models.Model):
    name = models.CharField(max_length=100)
    driver_name = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=RouteStatus.choices,
        default=RouteStatus.PLANNED,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Order(models.Model):
    route = models.ForeignKey(Route, related_name="orders", on_delete=models.CASCADE)
    code = models.CharField(max_length=50, unique=True)
    customer_name = models.CharField(max_length=100)
    address = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)