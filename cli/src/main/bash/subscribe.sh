#!/bin/bash

curl -k -XPOST -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyMTIzMmYyOS03YTU3LTM1YTctODM4OS00YTBlNGE4MDFmYzMiLCJleHAiOjE1MjA3OTYwNTd9.rvzTXrUzO87q68aPllaejA7zGWWn0WiWvSvvVyu0uSVVxn3HDxx2LVrEYI6GwgHnwYnmtTGH_b1_VFKT8PLCEA" -H "Content-Type: application/json" "https://localhost:8443/subscribe" --data "{\"source\":{\"uuid\": \"$1\"}, \"subsribers\": [{\"uuid\": \"$2\"}]}"