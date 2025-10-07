const ResponseDTO = require("../../_default/Response.dto");
const VideoInfoListResponse = require("../../dto/videoInfo/VideoInfoList.response");
const { VideoInfoService, VideoInfoExportService, VideoInfoImportService } = require("../../services/videoInfo/index");
const videoInfoValidation = require("../../validation/videoInfo/videoInfo.validation");
const KeywordResponse = require("../../dto/keyword/Keyword.response");


async function fetchList(req, res) {
    const { status: sourceStatus } = req.params

    videoInfoValidation.checkStatus(sourceStatus);

    query = req.query
    const { status } = videoInfoValidation.checkQueryStatusIsBySourceStatus(sourceStatus, query.status)

    const filters = {
        page: query.page || 1,
        take: query.take || 10,
        ...query,
        status
    }

    const user = req.user;
    if (
        sourceStatus === "init" &&
        user.permission !== 'admin' &&
        !user.access.includes("videos-full-access")
    ) {
        filters.userId = user.id;
    }

    const { videoDetails, count } = await VideoInfoService.list(filters);

    return ResponseDTO.success(res, { videoDetails: VideoInfoListResponse.create(videoDetails), count });
}

async function fetchAllList(req, res) {
    const query = req.query
    const filters = {
        page: query.page || 1,
        take: query.take || 10,
        ...query,
    }

    const { videoDetails, count } = await VideoInfoService.list(filters);

    return ResponseDTO.success(res, { videoDetails: VideoInfoListResponse.create(videoDetails), count });
}

async function fetchDetail(req, res) {
    const { videoFileId } = req.params;

    const response = await VideoInfoService.detail(videoFileId);
    return ResponseDTO.success(res, response?.[0]);
}

async function assignOwnerToProjectFiles(req, res) {
    const { projectId } = req.params
    const { ownerId } = req.body

    await VideoInfoService.setOwner2VideosOfProject(projectId, ownerId);
    return ResponseDTO.success(res, {})
}

async function fetchVideoInfosOfVideoFile(req, res) {
    const videoFileId = req.params.videoFileId;
    const response = await VideoInfoService.getSections_Service(videoFileId);
    return ResponseDTO.success(res, response);
}

async function modify(req, res) {
    const body = req.body;
    const { videoFileId } = req.params;

    const validData = await videoInfoValidation.update(body);
    const response = await VideoInfoService.update(
        videoFileId,
        req.user.id,
        validData
    );
    return ResponseDTO.success(res, response)
}

async function modifyInit(req, res) {
    const body = req.body;
    const { id: userId } = req.user;
    const { videoFileId } = req.params;

    const validData = await videoInfoValidation.update(body);
    const response = await VideoInfoService.initToCleaning(videoFileId, userId, validData);

    return ResponseDTO.success(res, response)
}

async function modifyCleaning(req, res) {
    const body = req.body;
    const videoFileId = req.params.videoFileId;

    const validData = await videoInfoValidation.update(body);
    const validStatus = await videoInfoValidation.updateCleaning(body);

    const response = await VideoInfoService.cleaning(videoFileId, req.user.id, {
        ...validData,
        ...validStatus
    });
    return ResponseDTO.success(res, response)
}

async function modifyStatus(req, res) {
    const { changeToStatus, videoFileIds, isExcludeMode, ...filters } = req.body;
    const { status } = videoInfoValidation.checkStatus(changeToStatus);
    await VideoInfoService.updateStatus_Service(videoFileIds, isExcludeMode, filters, status);
    return ResponseDTO.success(res);
}

async function modifyScores(req, res) {
    const { scores, videoFileIds, isExcludeMode, ...filters } = req.body;
    await VideoInfoService.updateScores_Service(req.user.id, videoFileIds, isExcludeMode, filters, scores);
    return ResponseDTO.success(res);
}


async function fetchExportInfoVideos(req, res) {

    const { videos, isExcludeMode, ...filters } = req.query
    const info = await VideoInfoService.getExportInfoVideos({ videos, isExcludeMode, filters })
    return ResponseDTO.success(res, info)
}

async function fetchSpecial(req, res) {
    const query = req.query
    const filters = {
        page: 1,
        take: 10,
        ...query
    };

    const user = req.user;
    if (
        user.permission !== 'admin'
        && !user.access.includes("video-list")
        && !user.access.includes("videos-full-access")
        && !user.access.includes("source-full-access")
    ) {
        filters.userId = user.id;
    }

    const { videoDetails, count } = await VideoInfoService.specialList(filters);

    return ResponseDTO.success(res, { videoDetail: VideoInfoListResponse.create(videoDetails), count });
}

async function fetchExportByIds(req, res) {
    const { videoDetails, isExcludeMode, ...filters } = req.query
    const videoIds = await VideoInfoExportService.getExportVideoDetailsId(videoDetails, isExcludeMode, filters)
    return ResponseDTO.success(res, videoIds)
}

async function exportSpecial(req, res) {
    const { exportType } = req.params;

    const query = req.query;
    const filters = {
        page: 1,
        excludesId: null,
        ...query
    };

    const user = req.user;
    if (user.permission !== 'admin' && !user.access.includes("videos-full-access")) {
        filters.userId = user.id;
    }

    const response = await VideoInfoExportService.exportSpecial(exportType, filters)

    return ResponseDTO.success(res, response);
}

async function exportData(req, res) {
    const { exportType } = req.params;

    const validData = videoInfoValidation.exportItems(req.query.videoDetailsId);
    const response = await VideoInfoExportService.export(exportType, validData.videoDetailsId)

    return ResponseDTO.success(res, response);
}

async function exportToExcel(req, res) {
    const { exportType, videoDetailId } = req.params;
    const videoDetails = await VideoInfoExportService.export(exportType, [videoDetailId])
    return ResponseDTO.success(res, videoDetails)
}

async function exportPath(req, res) {
    const { exportType } = req.params;
    const filters = req.query;
    const videoDetails = await VideoInfoExportService.exportSpecialPath(exportType, filters)
    return ResponseDTO.success(res, videoDetails)
}

async function importFromExcel(req, res) {
    await VideoInfoImportService.storeExcelFile(req);
    return ResponseDTO.success(res, {});
}

async function importRemovalFromExcel(req, res) {
    await VideoInfoImportService.storeRemovalExcelFile(req)
    return ResponseDTO.success(res, {});

}

async function fetchAiKeywordsTotalReport(req, res) {
    let response = await VideoInfoService.getTotalReport(req.query)
    return ResponseDTO.success(res, response);
}


async function fetchAiKeywordsReport(req, res) {
    let { rows, count } = await VideoInfoService.aiKeywordsList(req.query)
    return ResponseDTO.success(res, { rows, count });
}

async function fetchAiKeywordsDetail(req, res) {
    const { videoFileId } = req.params;
    let { allTags, aiTags, videoUrl } = await VideoInfoService.aiKeywordsReport(+videoFileId)
    return ResponseDTO.success(res, { videoUrl, allTags: KeywordResponse.create(allTags), aiTags: KeywordResponse.create(aiTags) });
}

async function createListLink(req, res) {
    const link = await VideoInfoService.generateFilterListLink(req.body)
    return ResponseDTO.success(res, { link })
}

async function fetchVideoListWithCode(req, res) {
    const { uuid } = req.params;
    const { page = 1, take = 10 } = req.query;
    const { videoDetails, count } = await VideoInfoService.getVideoListWithCode(uuid, { page, take })
    return ResponseDTO.success(res, { videoDetail: VideoInfoListResponse.create(videoDetails), count });
}

async function fetchDetailWithUUID(req, res) {
    const { videoFileId, uuid } = req.params;
    const response = await VideoInfoService.validateCodeWithVideoId(videoFileId, uuid);
    return ResponseDTO.success(res, response);
}


module.exports = {
    fetchList,
    fetchAllList,
    fetchDetail,
    assignOwnerToProjectFiles,
    fetchVideoInfosOfVideoFile,
    modify,
    modifyInit,
    modifyCleaning,
    modifyStatus,
    modifyScores,
    fetchExportInfoVideos,
    fetchSpecial,
    fetchExportByIds,
    exportSpecial,
    exportData,
    exportToExcel,
    exportPath,
    importFromExcel,
    importRemovalFromExcel,
    fetchAiKeywordsTotalReport,
    fetchAiKeywordsReport,
    fetchAiKeywordsDetail,
    createListLink,
    fetchVideoListWithCode,
    fetchDetailWithUUID
};