'use strict';
const kafka = require('kafka-node');
const _ = require('underscore');
const co = require('co');
const should = require('should');
const muk = require('muk');
const MessageConsumer = require('../../lib/kafka/messageConsumer');

describe('messageConsumer() use case test', ()=> {
    let messageConsumer;
    let client;
    let producer;
    before(done=> {
        function setupKafka() {
            return new Promise((resolve, reject)=> {
                let {ZOOKEEPER_SERVICE_HOST = "127.0.0.1", ZOOKEEPER_SERVICE_PORT = "2181"} = process.env;
                client = new kafka.Client(
                    `${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`,
                    "test-consumer-client");
                producer = new kafka.Producer(client);
                producer.on('ready', ()=> {
                    producer.createTopics(["data-arrive"], true, (err, data)=> {
                        if (err) {
                            reject(err)
                        }
                        client.refreshMetadata(["data-arrive"], (err)=> {
                            if (err) {
                                reject(err)
                            }
                            let message = {
                                s: "NWH-SW-SQ",
                                t: 1403610513000,
                                v: 110,
                                zipkinTrace: {
                                    traceID: "aaa",
                                    parentID: "bbb",
                                    spanID: "ccc",
                                    flags: 1,
                                    step: 3
                                }
                            };
                            producer.send([{
                                topic: "data-arrive",
                                messages: [JSON.stringify(message)]
                            }], (err)=> {
                                if (err) {
                                    reject(err)
                                }
                                resolve();
                            });
                        });
                    });
                });
                producer.on('error', (err)=> {
                    reject(err);
                });
            });
        };
        function* setup() {
            yield setupKafka();
        };
        co(setup).then(()=> {
            messageConsumer = new MessageConsumer("test-data-collect");
            done();
        }).catch(err=> {
            done(err);
        });
    });
    describe('#startConsume()', ()=> {
        context('start consume message', ()=> {
            it('should call dataPointCollectService.receiveData methods when consumer this topic', done=> {
                var mockDataPointCollectService = {};
                mockDataPointCollectService.receiveData = (originalData, traceContext, callback)=> {
                    originalData.s.should.eql("NWH-SW-SQ");
                    originalData.t.should.eql(1403610513000);
                    originalData.v.should.eql(110);
                    done();
                };
                muk(messageConsumer, "_dataPointCollectService", mockDataPointCollectService);
                messageConsumer.startConsume();
            });
            after(done=> {
                producer.close();
                client.close(()=> {
                    done();
                });
            });
        });
    });
    after(done=> {
        messageConsumer.stopConsume(()=> {
            done();
        });
    });
});