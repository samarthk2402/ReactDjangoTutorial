from django.shortcuts import render
from .credentials import *
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from requests import Request, post
from .util import update_or_create_token, is_spotify_authenticated, execute_spotify_api_call
from django.shortcuts import redirect
from .models import SpotifyToken, Vote
from .serializers import SpotifyTokenSerializer
from api.models import Room

# Create your views here.

class SpotifyTokenView(generics.ListAPIView):
    queryset = SpotifyToken.objects.all()
    serializer_class = SpotifyTokenSerializer


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-email user-read-private' #info we want to access
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

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_token(request.session.session_key, access_token, refresh_token, expires_in, token_type)

    return redirect("frontend:")

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)
    
class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session["room_code"]
        room = Room.objects.filter(code=room_code)
        if len(room) > 0:
            room = room[0]
            # if room.host == self.request.session.session_key:
            response = execute_spotify_api_call(room.host, "/player/currently-playing")

            if "item" not in response:
                    return Response({"message" : "no song playing..."}, status=status.HTTP_204_NO_CONTENT)
                
            if "error" in response:
                    return Response({"error" : response.get("error")}, status=status.HTTP_400_BAD_REQUEST)

            item = response.get("item")
            duration = item.get("duration_ms")
            progress = response.get("progress_ms")
            album_cover = item.get("album").get("images")[0].get("url")
            is_playing = response.get("is_playing")
            song_id = item.get("id")



            artist_string = ""

            for i, artist in enumerate(item.get("artists")):
                    if i >0:
                        artist_string += ", "
                    name = artist.get("name")
                    artist_string += name

            votes = len(Vote.objects.filter(room=room, song_id=song_id))

            song = {
                    "title": item.get("name"),
                    "artist": artist_string,
                    "duration": duration,
                    "playTime": progress,
                    "image_url": album_cover,
                    "isPlaying": is_playing,
                    "id": song_id,
                    "votes": votes,
                    "votesNeeded": room.votes_to_skip
                }
            
            self.update_room_song(room, song_id)

            return Response(song, status=status.HTTP_200_OK)
            #return Response({"Bad Request": "User not host of room..."}, status=status.HTTP_403_FORBIDDEN)

        return Response({"Bad Request": "User not in a room..."}, status=status.HTTP_400_BAD_REQUEST)
    
    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=["current_song"])
            Vote.objects.filter(room=room).delete()

    
class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session["room_code"]
        rooms = Room.objects.filter(code=room_code)
        if len(rooms) > 0:
            room = rooms[0]
            if self.request.session.session_key == room.host or room.guest_can_pause:
                response = execute_spotify_api_call(self.request.session.session_key, "/player/pause", put_=True)
                return Response(response, status=response.get("status"))
            return Response({"Bad Request": "User not allowed..."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"Bad Request": "User not in a room..."}, status=status.HTTP_400_BAD_REQUEST)
    
class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session["room_code"]
        rooms = Room.objects.filter(code=room_code)
        if len(rooms) > 0:
            room = rooms[0]
            if self.request.session.session_key == room.host or room.guest_can_pause:
                response = execute_spotify_api_call(self.request.session.session_key, "/player/play", put_=True)
                return Response(response, status=response.get("status"))
            return Response({"Bad Request": "User not allowed..."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"Bad Request": "User not in a room..."}, status=status.HTTP_400_BAD_REQUEST)
    
class SkipSong(APIView):
     def post(self, request, format=None):
        room_code = self.request.session["room_code"]
        rooms = Room.objects.filter(code=room_code)
        if len(rooms) > 0:
            room = rooms[0]
            votes = Vote.objects.filter(room=room, song_id=room.current_song)
            votes_needed = room.votes_to_skip
            if self.request.session.session_key == room.host or len(votes)+1>=votes_needed:
                votes.delete()
                response = execute_spotify_api_call(room.host, "/player/next", post_=True)
                return Response(response, status=response.get("status"))
            else:
                if(len(Vote.objects.filter(user=self.request.session.session_key))>0):
                    return Response({"message": "User already voted..."}, status=status.HTTP_226_IM_USED)
                vote = Vote(user=self.request.session.session_key, song_id=room.current_song, room=room)
                vote.save()
                return Response({"message": "user voted to skip"}, status=status.HTTP_202_ACCEPTED)
        return Response({"Bad Request": "User not in a room..."}, status=status.HTTP_400_BAD_REQUEST)
    
class IsPremium(APIView):
    def get(self, request, format=None):
        if "room_code" in self.request.session:
            room_code = self.request.session["room_code"]
            rooms = Room.objects.filter(code=room_code)
            if len(rooms) >0:
                room = rooms[0]
                if self.request.session.session_key == room.host:
                    response = execute_spotify_api_call(self.request.session.session_key, "")
                    return Response(response, status=status.HTTP_200_OK)
                return Response({"Bad Request": "User not host..."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"Bad Request": "User not in a room..."}, status=status.HTTP_400_BAD_REQUEST)

