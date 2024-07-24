from .views import index
from django.urls import path

app_name = "frontend"

urlpatterns = [
    path("", index, name=""),
    path("joinroom", index),
    path("createroom", index),
    path("room/<str:roomCode>", index)
]