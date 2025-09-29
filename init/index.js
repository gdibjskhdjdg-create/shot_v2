const UserService = require("../modules/services/user/User.service");
const { log, errorLog } = require("../helper/showLog");
const CheckServices = require("./CheckServices");

const createAdmin = async () => {
    let admin = await UserService.findAdmin();
    if(!admin){
        await UserService.createUser({ firstName: "ادمین", lastName: "ادمین", phone: "09999999999", password: "123456789"}, "admin");
        log("[+] Admin created !")
    }
}

(async () => {
    await createAdmin();
    CheckServices()
})()