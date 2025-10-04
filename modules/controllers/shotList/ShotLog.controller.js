const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const { shotLogService } = require("../../services/shotList/index");

async function getList(req, res) {
    const { shotId } = req.params

    const files = await shotLogService.getShotLogList(shotId, req.query)
    return BaseController.ok(res, files)
}


async function report(req, res) {
    const report = await shotLogService.getShoteReport(req.query)
    return BaseController.ok(res, report)
}

async function getSpecificDayReport(req, res) {
    const query = getDataFromReqQuery(req);
    const report = await shotLogService.specificDayLogReport(query)
    return BaseController.ok(res, report)
}

async function exportUserProjectsReport(req, res) {
    const { exportType, userId } = req.params
    const query = getDataFromReqQuery(req);
    let result = {}
    if (exportType == 'excel') {
        result = await shotLogService.exportExcelUserProjectsReport(userId, query)
    }
    return BaseController.ok(res, result)
}

async function geUserProjectsReport(req, res) {
    const { userId } = req.params
    const query = getDataFromReqQuery(req);
    const report = await shotLogService.getUserProjectsReport(userId, query)
    return BaseController.ok(res, report)
}


async function exportDailyReport(req, res) {
    const { exportType } = req.params
    const query = getDataFromReqQuery(req);
    let result = {}
    if (exportType == 'excel') {
        result = await shotLogService.exportExcelDailyReport(query)
    }
    return BaseController.ok(res, result)
}


async function getDailyReport(req, res) {
    const query = getDataFromReqQuery(req);
    const report = await shotLogService.getDailyReport(query)
    return BaseController.ok(res, report)
}


async function create(req, res) {
    const userId = req.user.id
    const { shotId } = req.params

    await shotLogService.createShotLog({ shotId, userId, body: req.body })

    return BaseController.ok(res)
}


module.exports = {
    getList,
    report,
    getSpecificDayReport,
    exportUserProjectsReport,
    geUserProjectsReport,
    exportDailyReport,
    getDailyReport,
    create
}