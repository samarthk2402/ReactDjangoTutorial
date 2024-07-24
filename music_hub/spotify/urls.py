from .views import AuthURL, spotify_callback, IsAuthenticated, SpotifyTokenView
from django.urls import path

urlpatterns = [
    path("tokens", SpotifyTokenView.as_view()),
    path("get-auth-url", AuthURL.as_view()),
    path("redirect", spotify_callback),
    path("is-authenticated", IsAuthenticated.as_view())
]