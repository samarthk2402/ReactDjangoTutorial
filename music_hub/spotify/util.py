from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import post, get, put
import base64
from .credentials import CLIENT_ID, CLIENT_SECRET

BASE_URL = "https://api.spotify.com/v1/me"

def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None

def update_or_create_token(session_id, access_token, refresh_token, expires_in, token_type):
    tokens = get_user_tokens(session_id)
    if expires_in != None:
        expires_in = timezone.now() + timedelta(seconds=expires_in)

        if tokens:
            tokens.access_token = access_token
            tokens.refresh_token = refresh_token
            tokens.expires_in = expires_in
            tokens.token_type = token_type
            print("updating access token")
            tokens.save(update_fields=["access_token", "refresh_token", "expires_in", "token_type"])
        else:
            tokens = SpotifyToken(user=session_id, access_token=access_token, refresh_token=refresh_token, expires_in=expires_in, token_type=token_type)
            tokens.save() 

def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)

    if tokens:
        expiry = tokens.expires_in

        if expiry <= timezone.now():
            print("Access token expired")
            response = refresh_spotify_token(session_id)
            return response

        return True
    return False

def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id)

    # Encode client_id and client_secret in base64
    auth_header = base64.b64encode(f'{CLIENT_ID}:{CLIENT_SECRET}'.encode('utf-8')).decode('utf-8')

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Basic {auth_header}'
    }

    response = post("https://accounts.spotify.com/api/token", data={
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }, headers=headers).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")
    
    if "error" in response:
        return False
    
    update_or_create_token(session_id, access_token, refresh_token, expires_in, token_type)
    return True

def execute_spotify_api_call(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    header = {"Content-Type": "application/json", "Authorization": "Bearer " + tokens.access_token}

    if post_:
        response = post(BASE_URL + endpoint, headers=header)
    if put_:
        response = put(BASE_URL + endpoint, headers=header)
    else:
        response = get(BASE_URL + endpoint, {}, headers=header)

    try:
        return response.json()
    except:
        return {"Error": "Issue with request...", "Response" : response}