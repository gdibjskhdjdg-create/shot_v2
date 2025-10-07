const VideoInfoStatus_Enum = {
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

const VideoInfoShotStatus_Enum = {
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

const findVideoInfoStatusByValue = (value) => {
    const key = Object.keys(VideoInfoStatus_Enum).find(key => VideoInfoStatus_Enum[key].value === value);
    if(key) return VideoInfoStatus_Enum[key];
    return null;
}

const findVideoInfoShotStatusByValue = (value) => {
    const key = Object.keys(VideoInfoShotStatus_Enum).find(key => VideoInfoShotStatus_Enum[key].value === value);
    if(key) return VideoInfoShotStatus_Enum[key];
    return null;
}

module.exports = {
    VideoInfoShotStatus_Enum,
    VideoInfoStatus_Enum,
    findVideoInfoStatusByValue,
    findVideoInfoShotStatusByValue
}