'use strict';
const { ShotInput } = require("../../_default/model");

const inputs = [
    { title: "مناسبت", type: "multiSelect", valuesFrom: "tag"},
    { title: "اشخاصی که در تصویر می بینید", type: "multiSelect", valuesFrom: "tag"},
    { title: "اشخاصی که با آن ها مصاحبه شده است", type: "multiSelect", valuesFrom: "tag"},
    { title: "کلیدواژه مصاحبه", type: "multiSelect", valuesFrom: "tag"},
    { title: "اشخاصی که در مورد آن ها صحبت شده است", type: "multiSelect", valuesFrom: "tag"},
    { title: "مکان فیلم", type: "multiSelect", valuesFrom: "tag"},
    { title: "مکانهایی که در مورد آن صحبت شده است", type: "multiSelect", valuesFrom: "tag"},
    { title: "کلیدواژه های نریشن", type: "multiSelect", valuesFrom: "tag"},
    { title: "نریتور", type: "multiSelect", valuesFrom: "tag"},
    { title: "کلیدواژه های مهم", type: "multiSelect", valuesFrom: "tag"},
];

module.exports = {
    async up() {
        for (let i = 0; i < inputs.length; i++) {
            const checkExist = await ShotInput.findOne({ where: { title: inputs[i].title }});
            if(checkExist) continue;

            try {
                await ShotInput.create(inputs[i])
            }
            catch (err) {
                console.log(err)
            }
        }
    },
    async down() {

    }
};