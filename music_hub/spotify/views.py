from django.shortcuts import render
from .credentials import *
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from requests import Request, post
from .util import update_or_create_token, is_spotify_authenticated
from django.shortcuts import redirect
from .models import SpotifyToken
from .serializers import SpotifyTokenSerializer

# Create your views here.

class SpotifyTokenView(generics.ListAPIView):
    queryset = SpotifyToken.objects.all()
    serializer_class = SpotifyTokenSerializer


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing' #info we want to access
        url = Request("GET", "https://accounts.spotify.com/authorize", params={
            "scope" : scopes,
            "response_type": "code",
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID
        }).prepare().url

        return Response({"url" : url}, status=status.HTTP_202_ACCEPTED)
    
def spotify_callback(request, format=None):
    code = request.GET.get("code")
    error = request.GET.get("error")
    print(error)

    response = post("https://accounts.spotify.com/api/token", data={
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")
    error_description = response.get("error_description")
    print(error)
    print(error_description)
    print("Expires in: " + str(expires_in) + " type: " + str(type(expires_in)))

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_token(request.session.session_key, access_token, refresh_token, expires_in, token_type)

    return redirect("frontend:")

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)
