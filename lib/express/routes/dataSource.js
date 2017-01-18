'use strict';
const _ = require('underscore');
const express = require('express');
const {errCodeTable} = require('../util');
const {expressWithZipkinTraceContextFeach:traceContextFeach} = require("gridvo-common-js");
const {logger} = require('../../util');

let router = express.Router();
router.get("/:dataSourceID", (req, res)=> {
    let traceContext = traceContextFeach(req);
    let dataSourceID = req.params.dataSourceID;
    let resultJSON = {};
    if (!dataSourceID) {
        resultJSON.errcode = errCodeTable.FAIL.errCode;
        resultJSON.errmsg = errCodeTable.FAIL.errMsg;
        res.json(resultJSON);
        logger.error(" no data source id", traceContext);
        return;
    }
    let dataSourceService = req.app.get('dataSourceService');
    dataSourceService.getDataSource(dataSourceID, traceContext, (err, dataSourceJSON)=> {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        if (!dataSourceJSON) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.json(resultJSON);
            logger.error("no this data source", traceContext);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.dataSource = dataSourceJSON;
        res.json(resultJSON);
        logger.info(`get data source ${dataSourceID} success`, traceContext);
    });
});

router.post("/", (req, res)=> {
    let dataSourceData = req.body;
    let dataSourceService = req.app.get('dataSourceService');
    let traceContext = traceContextFeach(req);
    let resultJSON = {};
    dataSourceService.registerDataSource(dataSourceData, traceContext, (err, isSuccess)=> {
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

module.exports = router;