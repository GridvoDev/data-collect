'use strict';
const kafka = require('kafka-node');
const _ = require('underscore');
const should = require('should');
const KafkaMessageProducer = require('../../../lib/infrastructure/message/kafkaMessageProducer');

describe('KafkaMessageProducer(topic, options) use case test', () => {
    let messageProducer;
    let consumer;
    before(done => {
        let {ZOOKEEPER_SERVICE_HOST = "127.0.0.1", ZOOKEEPER_SERVICE_PORT = "2181"} = process.env;
        let client = new kafka.Client(
            `${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`,
            "data-collect-producer-client");
        let initProducer = new kafka.Producer(client);
        initProducer.on('ready', () => {
            initProducer.createTopics(["data-source-added", "data-source-deleted", "data-source-config"], true, (err, data) => {
                if (err) {
                    done(err)
                }
                client.refreshMetadata(["data-source-added", "data-source-deleted", "data-source-config"], (err) => {
                    if (err) {
                        done(err)
                    }
                    messageProducer = new KafkaMessageProducer();
                    done();
                    initProducer.close();
                });
            });
        });
        initProducer.on('error', (err) => {
            done(err);
        });
    });
    describe('#produce{Topic}Message(message, traceContext, callback)', () => {
        let consumer1, consumer2, consumer3;
        context('produce topic message', () => {
            it('should return null if no message', done => {
                let message = null;
                let traceContext = {};
                messageProducer.produceDataSourceAddedTopicMessage(message, traceContext, (err, data) => {
                    if (err) {
                        done(err);
                    }
                    _.isNull(data).should.be.eql(true);
                    done();
                });
            });
            it('should return data if message is send success', done => {
                let currentDoneCount = 0;

                function doneMore(err) {
                    currentDoneCount++;
                    if (currentDoneCount == 3) {
                        if (err) {
                            done(err);
                        }
                        else {
                            done();
                        }
                    }
                };

                let message = {
                    id: "station-rain-other",
                    dataType: "dataType",
                    station: "stationID",
                    lessee: "lesseeID"
                };
                let message2 = {
                    dataSourceID: "station-rain-other"
                };
                let message3 = {
                    dataSourceID: "station-rain-other",
                    configs: {
                        FWJ: 90
                    }
                };
                let traceContext = {};
                messageProducer.produceDataSourceAddedTopicMessage(message, traceContext, (err, data) => {
                    if (err) {
                        doneMore(err);
                    }
                    _.isNull(data).should.be.eql(false);
                    let {ZOOKEEPER_SERVICE_HOST = "127.0.0.1", ZOOKEEPER_SERVICE_PORT = "2181"} = process.env;
                    let client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
                    let topics = [{
                        topic: "data-source-added"
                    }];
                    let options = {
                        groupId: "test-group"
                    };
                    consumer1 = new kafka.HighLevelConsumer(client, topics, options);
                    consumer1.on('message', function (message) {
                        let data = JSON.parse(message.value);
                        data.id.should.be.eql("station-rain-other");
                        data.dataType.should.be.eql("dataType");
                        data.station.should.be.eql("stationID");
                        data.lessee.should.be.eql("lesseeID");
                        doneMore();
                    });
                });
                messageProducer.produceDataSourceDeletedTopicMessage(message2, traceContext, (err, data) => {
                    if (err) {
                        doneMore(err);
                    }
                    _.isNull(data).should.be.eql(false);
                    let {ZOOKEEPER_SERVICE_HOST = "127.0.0.1", ZOOKEEPER_SERVICE_PORT = "2181"} = process.env;
                    let client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
                    let topics = [{
                        topic: "data-source-deleted"
                    }];
                    let options = {
                        groupId: "test-group"
                    };
                    consumer2 = new kafka.HighLevelConsumer(client, topics, options);
                    consumer2.on('message', function (message) {
                        let data = JSON.parse(message.value);
                        data.dataSourceID.should.be.eql("station-rain-other");
                        doneMore();
                    });
                });
                messageProducer.produceDataSourceConfigTopicMessage(message3, traceContext, (err, data) => {
                    if (err) {
                        doneMore(err);
                    }
                    _.isNull(data).should.be.eql(false);
                    let {ZOOKEEPER_SERVICE_HOST = "127.0.0.1", ZOOKEEPER_SERVICE_PORT = "2181"} = process.env;
                    let client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
                    let topics = [{
                        topic: "data-source-config"
                    }];
                    let options = {
                        groupId: "test-group"
                    };
                    consumer3 = new kafka.HighLevelConsumer(client, topics, options);
                    consumer3.on('message', function (message) {
                        let data = JSON.parse(message.value);
                        data.dataSourceID.should.be.eql("station-rain-other");
                        data.configs.FWJ.should.be.eql(90);
                        doneMore();
                    });
                });
            });
            after(done => {
                consumer1.close();
                consumer2.close();
                consumer3.close(true, (err) => {
                    if (err) {
                        done(err);
                    }
                    done();
                });
            });
        });
    });
    after(done => {
        messageProducer.close().then(done);
    });
});