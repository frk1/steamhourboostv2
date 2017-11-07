FROM mhart/alpine-node:9
WORKDIR /app
COPY . /app
RUN yarn global add pm2 \
 && pm2 install coffeescript \
 && yarn install \
 && yarn cache clean

FROM mhart/alpine-node:base-9
WORKDIR /app
COPY --from=0 /app .
COPY . .
CMD [ "pm2-docker", "start", "--auto-exit", "/app/app.json" ]
