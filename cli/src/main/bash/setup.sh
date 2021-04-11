#!/bin/bash

curl -k -XPOST -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyMTIzMmYyOS03YTU3LTM1YTctODM4OS00YTBlNGE4MDFmYzMiLCJleHAiOjE1MjA3ODY3NTV9.Iw82horhMw4XWSepPRRidM5EjRc1tdbiet-Uog3BtMYAUp7rCaPD4Wu1Z0p4qK6z_GvlT-mUXfmK3U-h8NMTow" -H "Content-Type: application/json" "https://localhost:8443/setup" --data "{\"partition\": \"$1\", \"device\": \"$2\"}"