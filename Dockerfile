FROM node:alpine

WORKDIR /app
COPY . /app

RUN yarn global add pm2 \
 && pm2 install coffeescript \
 && yarn install \
 && yarn cache clean

CMD [ "pm2-docker", "start", "--auto-exit", "/app/app.json" ]
