'use strict';
const { ShotDefaultValue } = require("./../../_default/model");

const frameRates = [
    { section: "frameRate", key: "23.98", value: "23.98" },
    { section: "frameRate", key: "24", value: "24"  },
    { section: "frameRate", key: "24.49", value: "24.49" },
    { section: "frameRate", key: "24.98", value: "24.98" },
    { section: "frameRate", key: "25", value: "25"  },
    { section: "frameRate", key: "29.97", value: "29.97" },
    { section: "frameRate", key: "30", value: "30"  },
    { section: "frameRate", key: "47.95", value: "47.95" },
    { section: "frameRate", key: "49.95", value: "49.95" },
    { section: "frameRate", key: "50", value: "50"  },
    { section: "frameRate", key: "59.94", value: "59.94" },
    { section: "frameRate", key: "60", value: "60"  },
    { section: "frameRate", key: "119.88", value: "119.88" },
    { section: "frameRate", key: "120", value: "120"  },
    { section: "frameRate", key: "100", value: "100"  },
];

const frameWidth = [
    { section: "frameWidth", key: "1280", value: "1280" },
    { section: "frameWidth", key: "1920", value: "1920" },
    { section: "frameWidth", key: "720", value: "720" },
    { section: "frameWidth", key: "2560", value: "2560" },
    { section: "frameWidth", key: "3740", value: "3740" },
    { section: "frameWidth", key: "426", value: "426" },
    { section: "frameWidth", key: "854", value: "854" },
    { section: "frameWidth", key: "3840", value: "3840" },
    { section: "frameWidth", key: "4096", value: "4096" },
    { section: "frameWidth", key: "2704", value: "2704" },
    { section: "frameWidth", key: "2688", value: "2688" },
    { section: "frameWidth", key: "1440", value: "1440" },
    { section: "frameWidth", key: "640", value: "640" },
    { section: "frameWidth", key: "480", value: "480" },
    { section: "frameWidth", key: "352", value: "352" },
    { section: "frameWidth", key: "608", value: "608" },
    { section: "frameWidth", key: "2720", value: "2720" },
    { section: "frameWidth", key: "1024", value: "1024" },
];

const frameHeight = [
    { section: "frameHeight", key: "1080", value: "1080" },
    { section: "frameHeight", key: "720", value: "720" },
    { section: "frameHeight", key: "576", value: "576" },
    { section: "frameHeight", key: "480", value: "480" },
    { section: "frameHeight", key: "360", value: "360" },
    { section: "frameHeight", key: "240", value: "240" },
    { section: "frameHeight", key: "2160", value: "2160" },
    { section: "frameHeight", key: "1520", value: "1520" },
    { section: "frameHeight", key: "1512", value: "1512" },
    { section: "frameHeight", key: "270", value: "270" },
    { section: "frameHeight", key: "640", value: "640" },
    { section: "frameHeight", key: "352", value: "352" },
    { section: "frameHeight", key: "1088", value: "1088" },
    { section: "frameHeight", key: "540", value: "540" },
    { section: "frameHeight", key: "1530", value: "1530" },
]

const aspectRatio = [
    { section: "aspectRatio", key: "16.9", value: "16.9" },
    { section: "aspectRatio", key: "4.3", value: "4.3" },
    { section: "aspectRatio", key: "3.2", value: "3.2" },
    { section: "aspectRatio", key: "5.4", value: "5.4" },
    { section: "aspectRatio", key: "16.10", value: "16.10" },
    { section: "aspectRatio", key: "9.16", value: "9.16" },
]

const format = [
    { section: "format", key: "mp4", value: "mp4" },
    { section: "format", key: "mpg", value: "mpg" },
    { section: "format", key: "avi", value: "avi" },
    { section: "format", key: "mov", value: "mov" },
    { section: "format", key: "mxf", value: "mxf" },
    { section: "format", key: "MTS", value: "MTS" },
    { section: "format", key: "VOB", value: "VOB" },
]

const soundQuality = [
    { section: "soundQuality", key: "اهمیت ندارد", value: "none" },
    { section: "soundQuality", key: "بیصدا", value: "no" },
    { section: "soundQuality", key: "نویز", value: "noise" },
    { section: "soundQuality", key: "ضعیف", value: "weak" },
    { section: "soundQuality", key: "متوسط", value: "mid" },
    { section: "soundQuality", key: "خوب", value: "good" },
]

const color = [
    { section: "color", key: "رنگی", value: "0" },
    { section: "color", key: "هردو", value: "1" },
    { section: "color", key: "سیاه سفید", value: "2" },
]

const pictureEnvironment = [
    { section: "pictureEnvironment", key: "نمای خارجی", value: "0" },
    { section: "pictureEnvironment", key: "نمای داخلی", value: "1" },
]


const pictureView = [
    { section: "pictureView", key: "دور", value: "دور" },
    { section: "pictureView", key: "نزدیک", value: "نزدیک" },
    { section: "pictureView", key: "پرتره", value: "پرتره" },
    { section: "pictureView", key: "بسته", value: "بسته" },
    { section: "pictureView", key: "فلو", value: "فلو" },
]

const pictureType = [
    { section: "pictureType", key: "اسلوموشن", value: "اسلوموشن" },
    { section: "pictureType", key: "فست موشن", value: "فست موشن" },
    { section: "pictureType", key: "تایم لپس", value: "تایم لپس" },
    { section: "pictureType", key: "زوم", value: "زوم" },
    { section: "pictureType", key: "گوپرو", value: "گوپرو" },
    { section: "pictureType", key: "tilt (بالا، پایین)", value: "tilt (بالا، پایین)" },
    { section: "pictureType", key: "pan(راست،چپ)", value: "pan(راست،چپ)" },
    { section: "pictureType", key: "عکس", value: "عکس" },
    { section: "pictureType", key: "fisheye", value: "fisheye" },
    { section: "pictureType", key: "pov (نمای چشم)", value: "pov (نمای چشم)" },
]

const pictureMode = [
    { section: "pictureMode", key: "هلی شات", value: "هلی شات" },
    { section: "pictureMode", key: "از داخل هواپیما", value: "از داخل هواپیما" },
    { section: "pictureMode", key: "از داخل خودرو", value: "از داخل خودرو" },
    { section: "pictureMode", key: "از داخل هلیکوپتر", value: "از داخل هلیکوپتر" },
    { section: "pictureMode", key: "از پشت شیشه", value: "از پشت شیشه" },
    { section: "pictureMode", key: "زیر آب", value: "زیر آب" },
]

const dayNight = [
    { section: "dayNight", key: "روز", value: "day" },
    { section: "dayNight", key: "شب", value: "night" },
    { section: "dayNight", key: "طلوع", value: "rise" },
    { section: "dayNight", key: "غروب", value: "sunset" },
];

const ageRange = [
    { section: "ageRange", value: "baby", key: "نوزاد" },
    { section: "ageRange", value: "child", key: "کودک" },
    { section: "ageRange", value: "teen", key: "نوجوان" },
    { section: "ageRange", value: "young", key: "جوان" },
    { section: "ageRange", value: "midage", key: "میانسال" },
    { section: "ageRange", value: "old", key: "مسن" },
];

// const peopleWithAgeType = [
//     { section: "peopleWithAge", value: "baby", key: "نوزاد" },
//     { section: "peopleWithAge", value: "girlChild", key: "دختر بچه" },
//     { section: "peopleWithAge", value: "boyChild", key: "پسر بچه" },
//     { section: "peopleWithAge", value: "menTeen", key: "مرد نوجوان" },
//     { section: "peopleWithAge", value: "womenTeen", key: "زن نوجوان" },
//     { section: "peopleWithAge", value: "menYoung", key: "مرد جوان" },
//     { section: "peopleWithAge", value: "womenYoung", key: "زن جوان" },
//     { section: "peopleWithAge", value: "menMidAge", key: "مرد میانسال" },
//     { section: "peopleWithAge", value: "womenMidAge", key: "زن میانسال" },
//     { section: "peopleWithAge", value: "menOld", key: "مرد مسن" },
//     { section: "peopleWithAge", value: "womenOld", key: "زن مسن" },
// ];

module.exports = {
    async up() {
        const all = [
            ...frameRates.sort((a, b) => a.value - b.value),
            ...frameWidth.sort((a, b) => a.value - b.value),
            ...frameHeight.sort((a, b) => a.value - b.value),
            ...aspectRatio.sort((a, b) => a.value - b.value),
            ...format,
            ...soundQuality,
            ...pictureMode,
            ...pictureType,
            ...pictureView,
            ...dayNight,
            ...color,
            ...pictureEnvironment,
            // ...peopleWithAgeType,
            ...ageRange,
        ]

        for(let i = 0; i < all.length; i++){
            const checkExist = await ShotDefaultValue.findOne({ where: all[i]});
            if(checkExist) continue;

            try{
                await ShotDefaultValue.create(all[i])
            }
            catch(err){
                console.log(err)
            }
        }
    },
    async down() {

    }
};