#!/bin/bash

curl -k -XPOST -H "Content-Type: application/json" "https://localhost:8443/unregister" --data "{\"uuid\": \"$1\", \"pin\": \"$2\"}"