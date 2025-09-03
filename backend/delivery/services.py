import csv
import io
from django.utils import timezone
from django.contrib.postgres.search import (
	SearchQuery,
	SearchRank,
	SearchVector,
)


def search_routes(query, queryset):
	vector = (
		SearchVector("name", weight="A")
		+ SearchVector("driver_name", weight="A")
	)
	search_query = SearchQuery(query)
	return (
		queryset.annotate(search=vector)
		.filter(search=search_query)
		.annotate(rank=SearchRank(vector, search_query))
		.order_by("-rank", "-updated_at", "id")
		.distinct()
	)


def search_orders(query, queryset):
	vector = (
		SearchVector("code", weight="A")
		+ SearchVector("customer_name", weight="B")
		+ SearchVector("address", weight="C")
	)
	search_query = SearchQuery(query)
	return (
		queryset.annotate(search=vector)
		.filter(search=search_query)
		.annotate(rank=SearchRank(vector, search_query))
		.order_by("-rank", "-updated_at", "id")
	)


def export_routes_to_csv(routes):
	buffer = io.StringIO()
	writer = csv.writer(buffer)
	writer.writerow(["ID", "Name", "Driver", "Status", "Orders", "Updated At"])
	for r in routes:
		writer.writerow([
			r.id,
			r.name,
			r.driver_name,
			r.status,
			r.orders.count(),
			r.updated_at.isoformat() if getattr(r, "updated_at", None) else "",
		])

	csv_data = buffer.getvalue().encode("utf-8")
	timestamp = timezone.now().strftime("%Y%m%d-%H%M%S")
	return (f"routes-{timestamp}.csv", csv_data)
