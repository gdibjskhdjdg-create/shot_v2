const VideoDetailStatus_Enum = {
    init: {
        value: "init",
        text: "بررسی اولیه"
    },
    cleaning: {
        value: "cleaning",
        text: "پاکسازی"
    },
    accept: {
        value: "accept",
        text: "تایید"
    },
    reject: {
        value: "reject",
        text: "رد"
    },
}

const VideoDetailShotStatus_Enum = {
    initCheck: {
        value: "init-check",
        text: "بررسی اولیه"
    },
    editor: {
        value: "editor",
        text: "تدوینگر"
    },
    equalizing: {
        value: "equalizing",
        text: "یکسان سازی"
    },
    equalized: {
        value: "equalized",
        text: "یکسان سازی شده"
    },
}

const findVideoDetailStatusByValue = (value) => {
    const key = Object.keys(VideoDetailStatus_Enum).find(key => VideoDetailStatus_Enum[key].value === value);
    if(key) return VideoDetailStatus_Enum[key];
    return null;
}

const findVideoDetailShotStatusByValue = (value) => {
    const key = Object.keys(VideoDetailShotStatus_Enum).find(key => VideoDetailShotStatus_Enum[key].value === value);
    if(key) return VideoDetailShotStatus_Enum[key];
    return null;
}

module.exports = {
    VideoDetailShotStatus_Enum,
    VideoDetailStatus_Enum,
    findVideoDetailStatusByValue,
    findVideoDetailShotStatusByValue
}