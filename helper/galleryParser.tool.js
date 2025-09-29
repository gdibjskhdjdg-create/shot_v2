
const GalleryParser = (gallery) => {
    if(!gallery){
        return []
    }
    gallery = JSON.parse(gallery);
    gallery = gallery.map(item => ({
        ...item,
        url: `${appConfigs.STORE_URL}/${item.path}/${item.fileName}`
    }))

    return gallery;
}

module.exports = GalleryParser;
