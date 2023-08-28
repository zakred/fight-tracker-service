FROM node:18.17-alpine
WORKDIR /app
COPY . /app/
RUN yarn install
ENTRYPOINT [ "sh", "-c", "yarn start" ]