from .views import index
from django.urls import path

urlpatterns = [
    path("", index),
    path("joinroom", index),
    path("createroom", index),
    path("room/<str:roomCode>", index)
]