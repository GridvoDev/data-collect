'use strict';
const kafka = require('kafka-node');
const express = require('express');
const bodyParser = require('body-parser');
const {expressZipkinMiddleware} = require("gridvo-common-js");
const {logger, tracer} = require('./lib/util');
const {dataSourceRouter} = require('./lib/express');
const {createDataSourceService} = require('./lib/application');
const {MessageConsumer} = require('./lib/kafka');

let app;
let {ZOOKEEPER_SERVICE_HOST = "127.0.0.1", ZOOKEEPER_SERVICE_PORT = "2181"} = process.env;
let Producer = kafka.HighLevelProducer;
let client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
let initProducer = new Producer(client);
initProducer.on('ready', function () {
    initProducer.createTopics(["data-arrive",
        "zipkin"], true, (err)=> {
        if (err) {
            logger.error(err.message);
            return;
        }
        client.refreshMetadata(["data-arrive",
            "zipkin"], ()=> {
            initProducer.close(()=> {
                logger.info("init kafka topics success");
                let messageConsumer = new MessageConsumer();
                messageConsumer.startConsume();
                logger.info("start consuming topics");
            });
        });
    });
});
initProducer.on('error', (err)=> {
    logger.error(err.message);
});
app = express();
app.use(bodyParser.json());
app.use(expressZipkinMiddleware({
    tracer: tracer,
    serviceName: 'data-collect'
}));
app.use('/data-sources', dataSourceRouter);
let dataSourceService = createDataSourceService();
app.set('dataSourceService', dataSourceService);
app.listen(3001, (err)=> {
    if (err) {
        logger.error(err.message);
    }
    else {
        logger.info("express server is starting");
    }
});