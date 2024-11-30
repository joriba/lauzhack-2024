# Simple nginx docker container based on the latest alpine image
# ===============================================================
# /etc/nginx/nginx.conf -> Config
# ===============================================================

# Base from lastest alpine image
FROM    alpine:latest

WORKDIR /app

ARG     WEB_USER_GID
ARG     WEB_USER_UID

# Install nginx and relevant modules
RUN     apk add --update --no-cache nginx \
            nginx-mod-http-headers-more \
            shadow

# Set UID of 'nginx'
RUN     groupmod -g $WEB_USER_GID nginx && \
        usermod -u $WEB_USER_UID -g $WEB_USER_GID nginx

# Run nginx
CMD     ["nginx", "-g", "daemon off;"]

