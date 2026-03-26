#!/bin/sh
# Generate runtime env config from environment variables.
# This runs at container start, so EasyPanel "Environment Variables" work.
cat <<EOF > /usr/share/nginx/html/env.js
window.__ENV__={
  VITE_WEBHOOK_GRUPO1:"${VITE_WEBHOOK_GRUPO1}",
  VITE_WEBHOOK_GRUPO2:"${VITE_WEBHOOK_GRUPO2}",
  VITE_WEBHOOK_GRUPO3:"${VITE_WEBHOOK_GRUPO3}",
  VITE_WEBHOOK_GRUPO4:"${VITE_WEBHOOK_GRUPO4}",
  VITE_AUTH_PASSWORD:"${VITE_AUTH_PASSWORD}"
};
EOF

exec nginx -g 'daemon off;'
