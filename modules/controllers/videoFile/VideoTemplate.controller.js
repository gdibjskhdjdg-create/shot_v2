const { getDataFromReqQuery } = require("../../../helper/general.tool");
const ResponseDTO = require("../../_default/Response.dto");
const { videoTemplateService } = require("../../services/videoFile/index");
const VideoTemplateValidation = require("../../validation/videoFile/VideoTemplate.validation");
const VideoTemplateResponse = require("../../dto/videoFile/VideoTemplate.response");

const getVideoTemplateList = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const templates = await videoTemplateService.getList(query);

    return ResponseDTO.success(res, {
        count: templates.count,
        rows: VideoTemplateResponse.create(templates.rows)
    })
}

const showVideoTemplate = async (req, res) => {
    const { templateId } = req.params;
    const template = await videoTemplateService.show(templateId);

    return ResponseDTO.success(res, VideoTemplateResponse.create(template));
}

const createVideoTemplate = async (req, res) => {
    const { logoFile, ...fields } = req.body

    const file = logoFile?.toBuffer()
    const fileName = logoFile?.filename

    let validData = VideoTemplateValidation.createTemplate(fields)

    await videoTemplateService.create(validData, file, fileName)
    return ResponseDTO.success(res);
}

const updateVideoTemplate = async (req, res) => {
    const { templateId } = req.params

    const { logoFile, ...fields } = req.body

    const file = logoFile?.toBuffer()
    const fileName = logoFile?.filename

    let validData = VideoTemplateValidation.updateTemplate(fields)

    await videoTemplateService.update(+templateId, validData, file, fileName)
    return ResponseDTO.success(res)
}

const deleteVideoTemplate = async (req, res) => {
    const { templateId } = req.params
    await videoTemplateService.delete(templateId)
    return ResponseDTO.success(res)
}

module.exports = {
    getVideoTemplateList,
    showVideoTemplate,
    createVideoTemplate,
    updateVideoTemplate,
    deleteVideoTemplate
};