'use strict';
const { Language } = require("../../_default/model");

const languages = [
    { name: "فارسی" },
    { name: "عربی" },
    { name: "انگلیسی" },
    { name: "هندی" },
    { name: "ترکی" },
    { name: "افغانستانی" },
    { name: "بلوچی" },
    { name: "کردی" },
];


module.exports = {
    async up() {
        for (let i = 0; i < languages.length; i++) {
            try {
                await Language.findOrCreate({ where: languages[i] })
            }
            catch (err) {
                console.log(err)
            }
        }
    },
    async down() {

    }
};