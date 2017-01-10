'use strict';
const {KafkaZipkinMessageConsumer, kafkaWithZipkinTraceContextFeach} = require('gridvo-common-js');
const {tracer} = require('../util');
const {createDataPointCollectService} = require('../application');
const {logger} = require('../util');

class Consumer {
    constructor(serviceName = "data-collect") {
        this._consumer = new KafkaZipkinMessageConsumer({tracer, serviceName});
        this._dataPointCollectService = createDataPointCollectService();
    }

    startConsume() {
        let topics = [{
            topic: "data-arrive"
        }];
        let self = this;
        this._consumer.consumeMessage(topics, (err, message)=> {
            if (err) {
                logger.error(err.message);
                return;
            }
            let data = JSON.parse(message.value);
            let traceContext = kafkaWithZipkinTraceContextFeach(data);
            switch (message.topic) {
                case "data-arrive":
                    delete data.zipkinTrace;
                    let originalData = data;
                    self._dataPointCollectService.receiveData(originalData, traceContext, (err, isSuccess)=> {
                        if (err) {
                            logger.error(err.message, traceContext);
                            return;
                        }
                        if (isSuccess) {
                            logger.info(`receive "${originalData.s}" data success`, traceContext);
                        } else {
                            logger.error(`receive "${originalData.s}" data fail`, traceContext);
                        }
                    });
                    return;
                default:
                    logger.error(`unknow topic "${message.topic}"`, traceContext);
                    return;
            }
        });
    }

    stopConsume(callback) {
        this._consumer.close(callback);
    }
}

module.exports = Consumer;
