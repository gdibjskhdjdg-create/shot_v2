const ResponseDTO = require("../../_default/Response.dto");
const { videoTemplateService } = require("../../services/videoFile/index");
const VideoTemplateValidation = require("../../validation/videoFile/VideoTemplate.validation");
const VideoTemplateResponse = require("../../dto/videoFile/VideoTemplate.response");

const fetchList = async (req, res) => {
    const templates = await videoTemplateService.getList(req.query);

    return ResponseDTO.success(res, {
        count: templates.count,
        rows: VideoTemplateResponse.create(templates.rows)
    })
}

const show = async (req, res) => {
    const { templateId } = req.params;
    const template = await videoTemplateService.show(templateId);

    return ResponseDTO.success(res, VideoTemplateResponse.create(template));
}

const create = async (req, res) => {
    const { logoFile, ...fields } = req.body

    const file = logoFile?.toBuffer()
    const fileName = logoFile?.filename

    let validData = VideoTemplateValidation.createTemplate(fields)

    await videoTemplateService.create(validData, file, fileName)
    return ResponseDTO.success(res);
}

const update = async (req, res) => {
    const { templateId } = req.params

    const { logoFile, ...fields } = req.body

    const file = logoFile?.toBuffer()
    const fileName = logoFile?.filename

    let validData = VideoTemplateValidation.updateTemplate(fields)

    await videoTemplateService.update(+templateId, validData, file, fileName)
    return ResponseDTO.success(res)
}

const destroy = async (req, res) => {
    const { templateId } = req.params
    await videoTemplateService.delete(templateId)
    return ResponseDTO.success(res)
}

module.exports = {
    fetchList,
    show,
    create,
    update,
    destroy
};