FROM python:3.12.11-alpine

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Update apk and install necessary packages
RUN apk update
RUN apk add build-base python3-dev musl-dev linux-headers curl netcat-openbsd

# Upgrade pip
RUN pip install --upgrade pip

# Set working directory
WORKDIR /app

# Copy requirements.txt and install Python dependencies
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of Django project
COPY ./ .

# Add entrypoint script
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Default command will be provided by docker-compose, but set a safe default
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--worker-class", "uvicorn.workers.UvicornWorker", "logistics.asgi"]
