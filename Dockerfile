# Stage 1: Build
FROM node:22-slim AS build
WORKDIR /app

# Build-time env vars (Vite bakes these into the JS bundle at build time).
# These must be Docker ARG -> ENV. Setting them as EasyPanel "Environment Variables"
# (runtime) does NOT work -- Vite replaces import.meta.env.VITE_* at build time only.
# In EasyPanel: use "Build Variables" (Build Args), not "Environment Variables".
ARG VITE_WEBHOOK_GRUPO1
ARG VITE_WEBHOOK_GRUPO2
ARG VITE_WEBHOOK_GRUPO3
ARG VITE_WEBHOOK_GRUPO4
ARG VITE_AUTH_PASSWORD

ENV VITE_WEBHOOK_GRUPO1=$VITE_WEBHOOK_GRUPO1
ENV VITE_WEBHOOK_GRUPO2=$VITE_WEBHOOK_GRUPO2
ENV VITE_WEBHOOK_GRUPO3=$VITE_WEBHOOK_GRUPO3
ENV VITE_WEBHOOK_GRUPO4=$VITE_WEBHOOK_GRUPO4
ENV VITE_AUTH_PASSWORD=$VITE_AUTH_PASSWORD

# Install dependencies first (layer caching: only re-runs if package files change)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
