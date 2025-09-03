import json
from typing import Any, Dict

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.urls import path


def broadcast_to_group(group, event_type, payload):
	channel_layer = get_channel_layer()
	message = {"type": "broadcast", "event": event_type, "payload": payload}
	async_to_sync(channel_layer.group_send)(group, message)


class DashboardConsumer(AsyncJsonWebsocketConsumer):
	async def connect(self):
		self.group_name = 'dashboard'
		await self.channel_layer.group_add(self.group_name, self.channel_name)
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.group_name, self.channel_name)

	async def broadcast(self, event):
		await self.send_json({
			"event": event.get("event"),
			"payload": event.get("payload"),
		})


class RouteDetailConsumer(AsyncJsonWebsocketConsumer):
	async def connect(self):
		route_id = int(self.scope["url_route"]["kwargs"]["pk"])
		self.group_name = f"route.{route_id}"
		await self.channel_layer.group_add(self.group_name, self.channel_name)
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.group_name, self.channel_name)

	async def broadcast(self, event):
		await self.send_json({
			"event": event.get("event"),
			"payload": event.get("payload"),
		})


websocket_urlpatterns = [
	path("ws/dashboard/", DashboardConsumer.as_asgi()),
	path("ws/routes/<int:pk>/", RouteDetailConsumer.as_asgi()),
]
