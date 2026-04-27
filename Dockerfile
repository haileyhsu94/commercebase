# =============================================================================
# CommerceBase / ads.realry.com — Per-commit Production Image
# Base = ads-realry-base (PHP + Playwright + Worker node_modules pre-installed)
#
# Build (CI / production):
#   docker buildx build --platform linux/arm64 --target container-service \
#     -t ads-realry:local -f Dockerfile .
#
# Build (local — base built locally with tag ads-realry-base:1.0):
#   docker buildx build --build-arg BASE_IMAGE=ads-realry-base:1.0 \
#     --target container-service -t ads-realry:local -f Dockerfile .
#
# Per-commit ~80MB delta vs base (~1.1GB).
# =============================================================================

ARG BASE_IMAGE=440092377860.dkr.ecr.us-east-1.amazonaws.com/ads-realry-base:1.0
FROM ${BASE_IMAGE} AS base

##############################################
# Stage 1: Composer dependencies
##############################################
FROM base AS composer-deps

WORKDIR /var/www
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-progress --ignore-platform-req=ext-mongodb

COPY backend/ /var/www
# Clear stale bootstrap/cache from local dev (Pail/Telescope dev-only providers
# baked into local cache aren't present in --no-dev vendor/). Laravel rebuilds.
RUN rm -f bootstrap/cache/*.php
# --no-scripts: skip artisan package:discover (runs at first request anyway).
RUN composer dump-autoload --optimize --no-dev --no-scripts

##############################################
# Stage 2: Worker TypeScript compile
# (node_modules already in base — only ./src + tsconfig differs per commit)
##############################################
FROM base AS worker-build

WORKDIR /opt/dailyclicks-worker
COPY dailyclicks-worker/src ./src
COPY dailyclicks-worker/tsconfig.json ./
# typescript + @types/node already installed in base node_modules
RUN ./node_modules/.bin/tsc

##############################################
# Stage 3: Production
##############################################
FROM base AS container-service

# Configs
RUN rm -f /etc/nginx/sites-enabled/default
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/php-fpm.conf /etc/php/8.4/fpm/pool.d/zzz-app.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/app.conf

# App backend
WORKDIR /var/www
COPY --from=composer-deps /var/www /var/www

# Worker dist (node_modules already in base at /opt/dailyclicks-worker/node_modules)
COPY --from=worker-build /opt/dailyclicks-worker/dist /opt/dailyclicks-worker/dist

# Default worker path (overridable via env)
ENV DAILYCLICKS_WORKER_PATH=/opt/dailyclicks-worker/dist/index.js

# Storage perms
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache /var/www

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/app.conf", "-n"]
