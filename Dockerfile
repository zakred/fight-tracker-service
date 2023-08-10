FROM node:20-alpine
WORKDIR /app
COPY . /app/
RUN yarn install
ENTRYPOINT [ "sh", "-c", "yarn start" ]