const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const writeXlsxFile = require('write-excel-file/node');

const { Project, VideoFile } = require("../../_default/model");
const ErrorResult = require("../../../helper/error.tool");
const TypeTool = require("../../../helper/type.tool");
const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const { videoFileService } = require('../../services/videoFile/index');
const UserService = require("../../services/user/User.service");
const { secondToTimeFormat, sizeToFormat, generateRandomCode } = require('../../../helper/general.tool');
const { VideoDetailStatus_Enum } = require('../../models/videoDetail/enum/VideoDetail.enum');
const { shotService } = require('../shotList');
const { getTotalLogReport, createTotalLogSummary } = require('../shotList/ShotLog.service');
const { decryptFile } = require('../../../helper/fileEncryption.tool');

const FOLDER_TO_STORE = "excel";
const FULL_PATH_TO_STORE = path.join(__dirname, '..', '..', '..', appConfigs.STORE_FOLDER_FROM_APP_ROOT, FOLDER_TO_STORE);
if (!fs.existsSync(FULL_PATH_TO_STORE)) {
    fs.mkdirSync(FULL_PATH_TO_STORE, { recursive: true });
}

const getProjectById = async (id) => {
    const project = await Project.findByPk(id);
    if (!project) {
        throw ErrorResult.notFound('Project not found');
    }
    return project;
};

const listProjects = async (filters = {}) => {
    const { id = null, page = null, take = null, userId = null, sortKey = null, sortACS = null, search = "" } = filters;

    let sqlQuery = {
        where: {},
        include: [],
        order: [["createdAt", "DESC"]]
    };

    if (id) sqlQuery.where.id = id;
    if (TypeTool.boolean(search)) sqlQuery.where.title = { [Op.like]: `%${TypeTool.string(search).trim()}%` };
    if (userId) {
        sqlQuery.distinct = true;
        sqlQuery.include.push({
            model: VideoFile,
            attributes: ['id', 'userId', 'shotCount', 'projectId'],
            where: { userId },
            as: 'videoFile',
        });
    }

    if (sortKey && sortACS) {
        sqlQuery.order = [[sortKey, sortACS]];
    }

    sqlQuery = createPaginationQuery(sqlQuery, page, take);

    const response = await Project.findAndCountAll({ ...sqlQuery });

    return {
        projects: response.rows,
        count: response.count
    };
};

const updateProjectStatus = async (projectId) => {
    if (!projectId) return;

    const project = await getProjectById(projectId);
    if (!project) return;

    const videoFiles = await videoFileService.getByAttribute("projectId", projectId);
    if (videoFiles.length === 0) {
        project.shotStatus = 'shotting';
        await project.save();
        return;
    }

    let status = null;
    const videos = videoFiles.map(x => x.toJSON());
    const findShotZeroCount = videos.find(x => x.shotCount === 0);

    if (findShotZeroCount) {
        status = 'shotting';
    } else {
        const shotRows = await shotService.listShots({ projectId, page: 1, take: null });
        if (shotRows.count === 0) {
            status = 'shotting';
        } else {
            const shots = shotRows.shots.map(x => x.toJSON());
            const findShotHasNotEqualize = shots.find(x => !x.lastEqualizeLogId);
            status = findShotHasNotEqualize ? 'equalizing' : 'equalized';
        }
    }

    project.shotStatus = status;
    await project.save();
};

const exportProjectReportAsExcel = async (query) => {
    const { report: projects } = await getProjectReport({ ...query, page: 1, take: null });

    const header = [
        // ... header definition from original file
    ];

    const createdDataItem = (item, index) => {
        // ... item creation logic from original file
    };

    const rows = [header];
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        rows.push(createdDataItem(project, i));
    }

    const fileName = `${Date.now()}${generateRandomCode(5)}.xlsx`;
    const exportPath = path.join(FULL_PATH_TO_STORE, fileName);
    await writeXlsxFile(rows, { filePath: exportPath });

    return {
        fileName,
        link: `/download/${FOLDER_TO_STORE}/${fileName}`,
        path: exportPath
    };
};

const getProjectReport = async (query) => {
    let { projectId, userId, search, fromTime, toTime, page, take } = query;

    const rows = [];
    const { projects, count } = await listProjects({ id: projectId, search, userId, page, take });

    for (const project of projects) {
        const { totalLog } = await getUserReportForProject(project.id, { fromTime, toTime });
        const { videoFiles } = await videoFileService.getVideoFileList({ projectId: project.id });
        const { shots } = await shotService.listShots({ projectId: project.id, page: 1, take: null });

        const videoItems = { durations: 0, size: 0, cleaningCount: 0, initCount: 0, acceptCount: 0, rejectCount: 0 };
        const shotStatusCounts = { initCheck: 0, editor: 0, equalizing: 0, equalized: 0 };

        videoFiles.forEach(file => {
            videoItems.size += (+file.size);
            videoItems.durations += (+file.duration);
            if (file?.videoDetail?.status === VideoDetailStatus_Enum.init.value) videoItems.initCount++;
            else if (file?.videoDetail?.status === VideoDetailStatus_Enum.cleaning.value) videoItems.cleaningCount++;
            else if (file?.videoDetail?.status === VideoDetailStatus_Enum.accept.value) videoItems.acceptCount++;
            else if (file?.videoDetail?.status === VideoDetailStatus_Enum.reject.value) videoItems.rejectCount++;
        });

        shots.forEach(shot => {
            if (shot.status === "init-check") shotStatusCounts.initCheck++;
            if (shot.status === "editor") shotStatusCounts.editor++;
            if (shot.status === "equalizing") shotStatusCounts.equalizing++;
            if (shot.status === "equalized") shotStatusCounts.equalized++;
        });

        totalLog.project = project;
        totalLog.videoDuration = videoItems.durations;
        totalLog.size = videoItems.size;
        totalLog.videoFilesCount = videoFiles.length;
        totalLog.shotCount = shots.length;
        totalLog.workTimeEstimate = project.workTimeRatio * videoItems.durations;
        totalLog.equalizeEstimate = project.equalizeRatio * videoItems.durations;
        totalLog.shotDuration = shots.reduce((acc, shot) => acc + ((+shot.endTime - +shot.startTime)), 0);
        totalLog.notShot = videoFiles.length - [...new Set(shots.map(item => item.videoFileId))].length;
        totalLog.videoDetail.cleaningCount = videoItems.cleaningCount;
        totalLog.videoDetail.initCount = videoItems.initCount;
        totalLog.videoDetail.acceptCount = videoItems.acceptCount;
        totalLog.videoDetail.rejectCount = videoItems.rejectCount;
        totalLog.shot.initCheckCount = shotStatusCounts.initCheck;
        totalLog.shot.editorCount = shotStatusCounts.editor;
        totalLog.shot.equalizingCount = shotStatusCounts.equalizing;
        totalLog.shot.equalizedCount = shotStatusCounts.equalized;

        rows.push(totalLog);
    }

    return { report: rows, count };
};

const exportUserReportAsExcel = async (projectId, query) => {
    const { totalLog, groupArr } = await getUserReportForProject(projectId, query);
    // ... excel export logic from original file
    const fileName = `${Date.now()}${generateRandomCode(5)}.xlsx`;
    const exportPath = path.join(FULL_PATH_TO_STORE, fileName);
    // await writeXlsxFile(rows, { filePath: exportPath }); // Assuming `rows` is constructed

    return {
        fileName,
        link: `/download/${FOLDER_TO_STORE}/${fileName}`,
        path: exportPath
    };
};

const getUserReportForProject = async (projectId, query) => {
    const { totalLog, logDetailObj, videoFileAsObject } = await getTotalLogReport({ ...query, projectId });
    let groupArr = [];

    const countOfVideo = await videoFileService.getCountOfVideoFile({ projectId });
    const countOfShotVideoDistinct = await shotService.countUniqueVideoFilesByProjectId({ projectId });
    const project = await getProjectById(projectId);

    const userIds = [...new Set(logDetailObj.map(item => item.userId))];
    const users = await UserService.getByIds(userIds);

    totalLog.notShot = countOfVideo - countOfShotVideoDistinct;
    totalLog.workTimeEstimate = project.workTimeRatio * totalLog.videoDuration;
    totalLog.equalizeEstimate = project.equalizeRatio * totalLog.videoDuration;

    if (logDetailObj.length > 0) {
        let group = {};
        for (const log of logDetailObj) {
            if (!group[log.userId]) group[log.userId] = [];
            group[log.userId].push(log);
        }

        for (const userId in group) {
            let index = groupArr.push({
                ...createTotalLogSummary(group[userId], videoFileAsObject),
                user: { userId, fullName: (users.find(item => item.id == userId)).fullName }
            });
            groupArr[index - 1].workTimeEstimate = project.workTimeRatio * groupArr[index - 1].videoDuration;
            groupArr[index - 1].equalizeEstimate = project.equalizeRatio * groupArr[index - 1].videoDuration;
        }
    }

    return { totalLog, groupArr, projectInfo: project };
};

const getProjectByTitle = async (title) => {
    return await Project.findOne({ where: { title } });
};

const findOrCreateProjectByTitle = async (title) => {
    const [project] = await Project.findOrCreate({ where: { title } });
    return project;
};

const createProject = async (body) => {
    const existingProject = await getProjectByTitle(body.title);
    if (existingProject) {
        throw ErrorResult.badRequest("title is unique");
    }
    return await Project.create(body);
};

const updateProject = async (projectId, body = {}) => {
    const projectWithSameTitle = await Project.findOne({ where: { title: body.title, id: { [Op.not]: projectId } } });
    if (projectWithSameTitle) {
        throw ErrorResult.badRequest("title is unique");
    }

    const project = await getProjectById(projectId);
    Object.assign(project, body);
    await project.save();
    return project.toJSON();
};

const deleteProject = async (projectId) => {
    const project = await getProjectById(projectId);
    const { videoFiles } = await videoFileService.getVideoFileList({ projectId });

    for (const file of videoFiles) {
        const filePath = path.join(file.path, file.name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        await file.destroy();
    }

    await shotService.deleteShotsByProjectId(projectId);
    await project.destroy();
    return true;
};

const deleteMainFileOfProject = async (projectId) => {
    const project = await getProjectById(projectId);
    if (project.mainFile) {
        const decryptedFile = await decryptFile(project.mainFile);
        if (fs.existsSync(decryptedFile.path)) {
            fs.unlinkSync(decryptedFile.path);
        }
        project.mainFile = null;
        project.mainFilePassword = null;
        await project.save();
    }
    return true;
};

const syncProjectsByUUID = async (projects) => {
    let newProjects = [];
    for (let i = 0; i < projects.length; i++) {
        let project = await Project.findOne({ where: { UUID: projects[i].UUID } });
        if (!project) {
            project = await Project.create({ UUID: projects[i].UUID, title: projects[i].title });
        }

        newProjects.push({
            oldId: projects[i].id,
            id: project.id,
            UUID: projects[i].UUID
        });

        const { id, ...updateData } = projects[i];
        Object.assign(project, updateData);
        await project.save();
    }
    return newProjects;
};


module.exports = {
    listProjects,
    getProjectById,
    updateProjectStatus,
    exportProjectReportAsExcel,
    getProjectReport,
    exportUserReportAsExcel,
    getUserReportForProject,
    getProjectByTitle,
    findOrCreateProjectByTitle,
    createProject,
    updateProject,
    deleteProject,
    deleteMainFileOfProject,
    syncProjectsByUUID
};