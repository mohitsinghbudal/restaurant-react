    # Build stage
    FROM node:22-alpine AS build

    WORKDIR /app/frontend

    COPY package*.json ./

    RUN npm ci

    COPY . .

    RUN npm run build

    #production stage
    FROM nginx:alpine

    COPY --from=build /app/frontend/dist /usr/share/nginx/html

    EXPOSE 80

    CMD ["nginx", "-g", "daemon off;"]


