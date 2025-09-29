/* -------------------------------- Packages -------------------------------- */
const ErrorResult = require("../helper/error.tool");
const Gateway = require("./Gateway");
const fs = require('fs')
const MyFormData = require('form-data');

class Rash_Gateway extends Gateway {
    constructor() {
        super("https://vivide.ir")
        if (this.error) {
            console.log("[-] Error in product_Gateway ")
        }
    }

    async getProduct() {
        try {
            const result = await this.axios.get("/product");
            return result?.data?.result;
        }
        catch (err) {
            throw ErrorResult.badGateway(err, null, "product_Gateway_ping")
        }
    }

    async sendFile2Product(file) {
        try {
            const form = new MyFormData()
            form.append('action', 'upload_media_rash')
            form.append('file', fs.createReadStream(file));
            const result = await this.axios.post(`/wp-admin/admin-ajax.php`, form, {
                headers: {
                    'content-type': 'multipart/form-data',
                    'secretKey': appConfigs.VIVIDE_SECRET
                }
            });
            return result.data.fileID
        }
        catch (err) {
            console.log(err);
            throw err
        }
    }

    async sendProduct({
        title,
        sku,
        content,
        thumbID = 1,
        gifID = 2,
        videoID = 3,
        categories,
        tags,
        related_tags,
        attributes,
        locations,
        occasionTitle = [],
        occasionDate = null,
    }) {
        try {
            const form = new MyFormData()
            form.append('action', "create_product_content");
            form.append('title', title);
            form.append('sku', sku);
            form.append('content', content);

            if (thumbID) {
                form.append("thumbID", thumbID);
            }
            if (gifID) {
                form.append("gifID", gifID);
            }
            form.append("videoID", videoID);
            form.append("categories", JSON.stringify(categories));
            form.append("tags", JSON.stringify(tags));
            form.append("related_tags", JSON.stringify(related_tags));

            if (occasionDate) form.append("occasionDate", occasionDate);
            if (occasionTitle && occasionTitle.length > 0) form.append("occasionTitle", JSON.stringify(occasionTitle))
            if (locations && Object.keys(locations).length > 0) form.append("locations", JSON.stringify(locations));

            if (attributes) {
                form.append("attributes", JSON.stringify(attributes));
            }

            const result = await this.axios.post(`/wp-admin/admin-ajax.php`, form, {
                headers: {
                    'content-type': 'multipart/form-data',
                    'secretKey': appConfigs.VIVIDE_SECRET
                }
            });
            return result.data
        }
        catch (err) {
            console.log(err);
            throw ErrorResult.badGateway(err, null, "product_Gateway_find")
        }
    }

    async getProductStatus(productId) {
        const result = await this.axios.post(`/wp-admin/admin-ajax.php`, {
            action: 'post_status_rash',
            ID: productId
        }, {
            headers: {
                'content-type': 'multipart/form-data',
                'secretKey': appConfigs.VIVIDE_SECRET
            }
        });
        return result.data
    }

    async updateProductFiles(productId, {
        sku,
        thumbID,
        gifID,
        videoID,
    }) {
        try {
            const form = new MyFormData()
            form.append('action', "edit_product_content");
            form.append("ID", productId);

            if (sku) form.append("sku", sku);
            if (videoID) form.append("videoID", videoID);
            if (thumbID) form.append("thumbID", thumbID);
            if (gifID) form.append("gifID", gifID);
    

            const result = await this.axios.post(`/wp-admin/admin-ajax.php`, form, {
                headers: {
                    'content-type': 'multipart/form-data',
                    'secretKey': appConfigs.VIVIDE_SECRET
                }
            });

            return result.data
        }
        catch (err) {
            console.log(err);
            throw ErrorResult.badGateway(err, null, "product_Gateway_find")
        }
    }
}

module.exports = Rash_Gateway.getInstance();
