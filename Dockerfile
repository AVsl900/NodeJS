FROM node:18.7

WORKDIR /var/www

RUN apt-get update
RUN apt-get install -y nano mc make sqlite3 python

ADD public /var/www/public/
ADD views /var/www/views/
COPY app.js database.js package.json /var/www/

RUN mkdir /var/www/db

RUN npm i
