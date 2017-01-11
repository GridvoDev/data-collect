FROM node:latest
MAINTAINER linmadan <772181827@qq.com>
COPY ./package.json /home/data-collect/
WORKDIR /home/data-collect
RUN ["npm","config","set","registry","http://r.cnpmjs.org"]
RUN ["npm","install","--save-dev","mocha@3.2.0"]
RUN ["npm","install","--save-dev","muk@0.5.3"]
RUN ["npm","install","--save-dev","should@11.1.2"]
RUN ["npm","install","--save-dev","supertest@2.0.1"]
RUN ["npm","install","--save","co@4.6.0"]
RUN ["npm","install","--save","express@4.14.0"]
RUN ["npm","install","--save","kafka-node@1.1.0"]
RUN ["npm","install","--save","body-parser@1.15.2"]
RUN ["npm","install","--save","underscore@1.8.3"]
RUN ["npm","install","--save","mongodb@2.2.19"]
RUN ["npm","install","--save","gridvo-common-js@0.0.6"]
COPY ./app.js app.js
COPY ./lib lib
COPY ./test test
VOLUME ["/home/data-collect"]
ENTRYPOINT ["node"]
CMD ["app.js"]