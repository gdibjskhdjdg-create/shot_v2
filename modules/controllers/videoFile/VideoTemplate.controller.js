const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const { videoTemplateService } = require("../../services/videoFile/index");
const VideoTemplateValidation = require("../../validation/videoFile/VideoTemplate.validation");
const VideoTemplateResponse = require("../../dto/videoFile/VideoTemplate.response");

const getVideoTemplateList = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const templates = await videoTemplateService.getList(query);

    return BaseController.ok(res, {
        count: templates.count,
        rows: VideoTemplateResponse.create(templates.rows)
    })
}

const showVideoTemplate = async (req, res) => {
    const { templateId } = req.params;
    const template = await videoTemplateService.show(templateId);

    return BaseController.ok(res, VideoTemplateResponse.create(template));
}

const createVideoTemplate = async (req, res) => {
    const { logoFile, ...fields } = req.body

    const file = logoFile?.toBuffer()
    const fileName = logoFile?.filename

    let validData = VideoTemplateValidation.createTemplate(fields)

    await videoTemplateService.create(validData, file, fileName)
    return BaseController.ok(res);
}

const updateVideoTemplate = async (req, res) => {
    const { templateId } = req.params

    const { logoFile, ...fields } = req.body

    const file = logoFile?.toBuffer()
    const fileName = logoFile?.filename

    let validData = VideoTemplateValidation.updateTemplate(fields)

    await videoTemplateService.update(+templateId, validData, file, fileName)
    return BaseController.ok(res)
}

const deleteVideoTemplate = async (req, res) => {
    const { templateId } = req.params
    await videoTemplateService.delete(templateId)
    return BaseController.ok(res)
}

module.exports = {
    getVideoTemplateList,
    showVideoTemplate,
    createVideoTemplate,
    updateVideoTemplate,
    deleteVideoTemplate
};