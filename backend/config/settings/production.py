from .base import *


DEBUG = False

ALLOWED_HOSTS = os.getenv(
    "DJANGO_ALLOWED_HOSTS",
    "",
).split(",")

CORS_ALLOW_ALL_ORIGINS = False