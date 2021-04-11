#!/bin/bash

curl -k -XPOST -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyMTIzMmYyOS03YTU3LTM1YTctODM4OS00YTBlNGE4MDFmYzMiLCJleHAiOjE1MjA5NTg3NTN9.fPQnHiNAB78WcvzlyHX8UxmyLMr0kumwXuMB2iNYwelE2EEuNXtRKv6u3OEXyTqivSsKFD3OZY-pkZJfDdszKA" -H "Content-Type: application/json" "https://localhost:8443/get" --data "{\"uuid\": \"$1\"}"