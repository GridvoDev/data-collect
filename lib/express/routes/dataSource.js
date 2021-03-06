'use strict';
const _ = require('underscore');
const express = require('express');
const {errCodeTable} = require('../util');
const {expressWithZipkinTraceContextFeach:traceContextFeach} = require("gridvo-common-js");
const {logger} = require('../../util');

let router = express.Router();
router.get("/", (req, res) => {
    let traceContext = traceContextFeach(req);
    let resultJSON = {};
    let dataSourceService = req.app.get('dataSourceService');
    let queryOpts = {};
    if (req.query.dataType) {
        queryOpts.dataType = req.query.dataType;
    }
    if (req.query.lessee) {
        queryOpts.lessee = req.query.lessee;
    }
    if (req.query.station) {
        queryOpts.station = req.query.station;
    }
    if (req.query.dataSourceID) {
        queryOpts.dataSourceID = req.query.dataSourceID;
    }
    dataSourceService.getDataSources(queryOpts, traceContext, (err, dataSourcesJSON) => {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.dataSources = dataSourcesJSON;
        res.json(resultJSON);
        logger.info(`get data sources with queryOpt ${JSON.stringify(queryOpts)} success`, traceContext);
    });
});

router.get("/:dataSourceID", (req, res) => {
    let traceContext = traceContextFeach(req);
    let dataSourceID = req.params.dataSourceID;
    let resultJSON = {};
    if (!dataSourceID) {
        resultJSON.errcode = errCodeTable.FAIL.errCode;
        resultJSON.errmsg = errCodeTable.FAIL.errMsg;
        res.json(resultJSON);
        logger.error(" no data source id param", traceContext);
        return;
    }
    let dataSourceService = req.app.get('dataSourceService');
    dataSourceService.getDataSource(dataSourceID, traceContext, (err, dataSourceJSON) => {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        if (!dataSourceJSON) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.json(resultJSON);
            logger.error(`no this data source: ${dataSourceID}`, traceContext);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.dataSource = dataSourceJSON;
        res.json(resultJSON);
        logger.info(`get data source ${dataSourceID} success`, traceContext);
    });
});

router.delete("/:dataSourceID", (req, res) => {
    let traceContext = traceContextFeach(req);
    let dataSourceID = req.params.dataSourceID;
    let resultJSON = {};
    if (!dataSourceID) {
        resultJSON.errcode = errCodeTable.FAIL.errCode;
        resultJSON.errmsg = errCodeTable.FAIL.errMsg;
        res.json(resultJSON);
        logger.error(" no data source id param", traceContext);
        return;
    }
    let dataSourceService = req.app.get('dataSourceService');
    dataSourceService.removeDataSource(dataSourceID, traceContext, (err, isSuccess) => {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        if (isSuccess) {
            resultJSON.errcode = errCodeTable.OK.errCode;
            resultJSON.errmsg = errCodeTable.OK.errMsg;
            resultJSON.dataSourceID = dataSourceID;
            res.json(resultJSON);
            logger.info(`delete data source ${dataSourceID} success`, traceContext);
        }
        else {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.json(resultJSON);
            logger.error(`delete data source ${dataSourceID} fail`, traceContext);
        }
    });
});

router.post("/", (req, res) => {
    let dataSourceData = req.body;
    let dataSourceService = req.app.get('dataSourceService');
    let traceContext = traceContextFeach(req);
    let resultJSON = {};
    dataSourceService.registerDataSource(dataSourceData, traceContext, (err, isSuccess) => {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        if (!isSuccess) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.json(resultJSON);
            logger.error("register data source fail", traceContext);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        res.json(resultJSON);
        logger.info("register data source success", traceContext);
    });
});

router.post("/:dataSourceID/update-config", (req, res) => {
    let dataSourceID = req.params.dataSourceID;
    let configs = req.body;
    let dataSourceService = req.app.get('dataSourceService');
    let traceContext = traceContextFeach(req);
    let resultJSON = {};
    dataSourceService.updateDataSourceConfig(dataSourceID, configs, traceContext, (err, updatedConfigs) => {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        if (!updatedConfigs) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.json(resultJSON);
            logger.error(`update data source: ${dataSourceID} config fail`, traceContext);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.updatedConfigs = updatedConfigs;
        res.json(resultJSON);
        logger.info(`update data source: ${dataSourceID} config: ${JSON.stringify(updatedConfigs)} success`, traceContext);
    });
});

module.exports = router;