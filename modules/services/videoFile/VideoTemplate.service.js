const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");
const Service = require("../../_default/service");
const { VideoTemplate } = require("../../_default/model");
const path = require('path')
const fs = require('fs');
const { generateRandomCode, imageToBase64 } = require("../../../helper/general.tool");
const TypeTool = require("../../../helper/type.tool");
const { Op } = require("sequelize");
const { pipeline } = require('stream');
const util = require('util');
const pump = util.promisify(pipeline);


class VideoTemplateService extends Service {

    constructor() {
        super(VideoTemplate)
    }

    async getList(query = {}) {
        const templateId = query.templateId || null
        const page = query.page || 1
        const take = query.take || null
        const search = query.search || null

        let sqlQuery = {
            where: {},
            order: [["createdAt", "DESC"]]
        };

        if (search) {
            sqlQuery.where.title = {
                [Op.like]: `%${TypeTool.string(search).trim()}%`
            }
        }

        if (templateId) {
            sqlQuery.where.id = templateId
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);
        const response = await VideoTemplate.findAndCountAll({ ...sqlQuery });

        // response.rows = response.rows.map(item => {
        //     item = item.toJSON();
        //     if (item.logoParams) {
        //         item.logoParams = JSON.parse(item.logoParams);
        //         item.logoParams.url = this.generateNormalLink(item.logoParams.src)
        //     }
        //     return item;
        // });

        return response
    }

    async show(id) {
        let response = await this.getById(id);
        // response = response.toJSON();
        // if (response.logoParams) {
        //     response.logoParams = JSON.parse(response.logoParams);
        //     response.logoParams.url = this.generateNormalLink(response.logoParams.src)
        // }
        return response;
    }

    getRootDir() {
        return path.join(__dirname, "..", "..", "..");
    }

    async saveLogo(logoFileStream, fileName) {
        const fileExtension = fileName.split(".")[1] // (logoFile.originalFilename.split('.').reverse())[0]
        const newName = Date.now() + generateRandomCode(5) + '.' + fileExtension;

        const pathToFolder = path.join(this.getRootDir(), appConfigs.STORE_FOLDER_FROM_APP_ROOT, 'logo');
        if (!fs.existsSync(pathToFolder))
            fs.mkdirSync(pathToFolder, { recursive: true });

        const targetLogoPath = path.join(pathToFolder, newName)
        // fs.copyFileSync(logoFile.filepath, targetLogoPath);


        await pump(logoFileStream, fs.createWriteStream(targetLogoPath));

        return path.join('logo', newName)
    }

    async create(body, logoFileStream, logoFileName) {

        return await this.updateElements(new VideoTemplate(), body, logoFileStream, logoFileName)
    }

    async update(id, body, logoFileStream, logoFileName) {

        const template = await this.getById(id)
        return await this.updateElements(template, body, logoFileStream, logoFileName)

    }


    async updateElements(template, body, logoFileStream, logoFileName) {

        const { title, bitrate, quality, isMute, gifTime, logo, text } = body

        let logoParams = template.logoParams ? JSON.parse(template.logoParams) : {}
        logoParams = logo ? { ...logoParams, ...logo } : logo

        if (title) {
            template.title = title
        }
        if (quality) {
            template.quality = quality;
        }
        if (gifTime) {
            template.gifTime = gifTime
        }
        if (bitrate) template.bitrate = bitrate

        if (!TypeTool.isNullUndefined(isMute)) template.isMute = TypeTool.boolean2Int(isMute)

        if (logoFileStream) {
            logoParams.src = await this.saveLogo(logoFileStream, logoFileName);
        }

        if (text) template.textParams = Json.stringify(text)

        template.logoParams = JSON.stringify(logoParams)


        return await template.save()
    }

    logoTemplateWithFullPath(logoPath) {
        return path.join(this.getRootDir(), appConfigs.STORE_FOLDER_FROM_APP_ROOT, logoPath);
    
    }

    async delete(id) {

        const template = await this.getById(id)
        if (!template) return false
        const logo = template.logoParams ? JSON.parse(template.logoParams) : null
        if (logo && fs.existsSync(logo.src)) fs.unlinkSync(logo.src)
        await template.destroy(); // deletes the row


        return true
    }

}

module.exports = VideoTemplateService;
