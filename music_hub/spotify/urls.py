from .views import *
from django.urls import path

urlpatterns = [
    path("tokens", SpotifyTokenView.as_view()),
    path("get-auth-url", AuthURL.as_view()),
    path("redirect", spotify_callback),
    path("is-authenticated", IsAuthenticated.as_view()),
    path("get-current-song", CurrentSong.as_view()),
    path("pause-song", PauseSong.as_view()),
    path("play-song", PlaySong.as_view()),
    path("is-premium", IsPremium.as_view())
]