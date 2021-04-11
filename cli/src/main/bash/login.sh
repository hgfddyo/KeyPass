#!/bin/bash

curl -k -XPOST -H "Content-Type: application/json" "https://localhost:8443/login" --data "{\"login\": \"$1\", \"password\": \"$2\"}"
