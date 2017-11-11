FROM mhart/alpine-node:9
WORKDIR /app
COPY . /app
RUN yarn install --production && yarn cache clean

FROM mhart/alpine-node:base-9
WORKDIR /app
COPY --from=0 /app .
COPY . .
CMD [ "node", "/app/lib/app.js" ]
