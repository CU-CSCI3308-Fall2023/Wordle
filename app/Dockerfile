FROM node:lts

WORKDIR /app

#RUN apk add postgresql-client

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src src

RUN npm run build
EXPOSE 3000

ENTRYPOINT ["node", "dist/index.js"]
