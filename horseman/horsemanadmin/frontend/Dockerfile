FROM node:8

WORKDIR /code

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3010
EXPOSE 9009

CMD npm start
