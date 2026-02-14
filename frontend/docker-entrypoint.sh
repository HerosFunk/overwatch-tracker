#!/bin/sh

# Generate .htpasswd from environment variables
AUTH_USER="${AUTH_USER:-admin}"
AUTH_PASSWORD="${AUTH_PASSWORD:-changeme}"

htpasswd -bc /etc/nginx/.htpasswd "$AUTH_USER" "$AUTH_PASSWORD"
echo "Auth configured for user: $AUTH_USER"

# Start nginx
exec "$@"
