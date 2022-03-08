FROM node:14.17-alpine

WORKDIR /usr/src

COPY ./package.json ./

RUN npm i
RUN npm i -D

COPY . /usr/src

EXPOSE 4000

CMD ["npm", "run", "dev"]
