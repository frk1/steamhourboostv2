FROM mhart/alpine-node:9
WORKDIR /app
COPY . /app
RUN yarn install && yarn cache clean

FROM mhart/alpine-node:base-9
WORKDIR /app
COPY --from=0 /app .
COPY . .
CMD [ "/app/node_modules/.bin/coffee", "/app/src/app.coffee" ]
