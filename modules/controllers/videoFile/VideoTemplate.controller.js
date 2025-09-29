const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const { videoTemplateService } = require("../../services/videoFile/index");
const VideoTemplateValidation = require("../../validation/videoFile/VideoTemplate.validation");
const VideoTemplate_DTO = require("../../dto/videoFile/VideoTemplate.dto");

class VideoTemplateController {
    async getVideoTemplateList(req, res) {
        const query = getDataFromReqQuery(req);
        const templates = await videoTemplateService.getList(query);

        return BaseController.ok(res, {
            count: templates.count,
            rows: VideoTemplate_DTO.create(templates.rows)
        })
    }

    async showVideoTemplate(req, res) {
        const { templateId } = req.params;
        const template = await videoTemplateService.show(templateId);

        return BaseController.ok(res, VideoTemplate_DTO.create(template));
    }

    async createVideoTemplate(req, res) {

        const { logoFile, ...fields } = req.body

        const file = logoFile?.toBuffer()
        const fileName = logoFile?.filename

        let validData = VideoTemplateValidation.createTemplate(fields)

        await videoTemplateService.create(validData, file, fileName)
        return BaseController.ok(res);
    }

    async updateVideoTemplate(req, res) {

        const { templateId } = req.params

        const { logoFile, ...fields } = req.body

        const file = logoFile?.toBuffer()
        const fileName = logoFile?.filename

        let validData = VideoTemplateValidation.updateTemplate(fields)


        await videoTemplateService.update(+templateId, validData, file, fileName)
        return BaseController.ok(res)
    }

    async deleteVideoTemplate(req, res) {
        const { templateId } = req.params
        await videoTemplateService.delete(templateId)
        return BaseController.ok(res)
    }

}

module.exports = new VideoTemplateController();