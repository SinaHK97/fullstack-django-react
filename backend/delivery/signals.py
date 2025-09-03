from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from delivery.models import Order, Route
from delivery.serializers import OrderModelSerializer, RouteModelSerializer
from delivery.ws import broadcast_to_group


@receiver(post_save, sender=Order)
def order_saved(sender, instance, created, **kwargs):
	payload = OrderModelSerializer(instance).data
	action = "created" if created else "updated"
	route_id = instance.route_id
	broadcast_to_group(f"route.{route_id}", f"orders.{action}", payload)


@receiver(post_delete, sender=Order)
def order_deleted(sender, instance, **kwargs):
    payload = {"id": instance.id}
    action = 'deleted'
    route_id = instance.route_id
    broadcast_to_group(f"route.{route_id}", f"orders.{action}", payload)


@receiver(post_save, sender=Route)
def route_saved(sender, instance: Route, created, **kwargs):
    payload = RouteModelSerializer(instance).data
    action = "created" if created else "updated"
    route_id = instance.id
    broadcast_to_group(f"route.{route_id}", f"route.{action}", payload)
    broadcast_to_group('dashboard', f"routes.{action}", payload)


@receiver(post_delete, sender=Route)
def route_deleted(sender, instance, **kwargs):
    payload = {"id": instance.id}
    action = 'deleted'
    route_id = instance.id
    broadcast_to_group(f"route.{route_id}", f"routes.{action}", payload)
    broadcast_to_group('dashboard', f"routes.{action}", payload)
