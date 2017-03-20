'use strict';
const {KafkaZipkinMessageProducer} = require('gridvo-common-js');
const {tracer} = require('../../util');

class MessageProducer {
    constructor() {
        this._producer = new KafkaZipkinMessageProducer({
            tracer,
            serviceName: "data-monitoring"
        });
    }

    produceDataSourceAddedTopicMessage(message, traceContext, callback) {
        this._producer.produceMessage("data-source-added", message, traceContext, callback);
    }

    produceDataSourceDeletedTopicMessage(message, traceContext, callback) {
        this._producer.produceMessage("data-source-deleted", message, traceContext, callback);
    }

    produceDataSourceConfigTopicMessage(message, traceContext, callback) {
        this._producer.produceMessage("data-source-config", message, traceContext, callback);
    }


    close() {
        return this._producer.close();
    }
}

module.exports = MessageProducer;