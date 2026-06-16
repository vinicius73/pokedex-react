FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM ferronserver/ferron:2-alpine
COPY ferron.kdl /etc/ferron.kdl
COPY --from=build /app/build/client /var/www/pokedex
EXPOSE 3000
