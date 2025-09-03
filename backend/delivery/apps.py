from django.apps import AppConfig


class RouteConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'delivery'

    def ready(self):
        # Import signals to ensure receivers are registered
        import delivery.signals  # noqa: F401
