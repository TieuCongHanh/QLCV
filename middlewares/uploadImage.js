
const multer =  require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dwaxlarab',
    api_key: 463144176172629,
    api_secret: 'tOpeD35raURh0j_-h6WBvZh6GSs',

});
const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg','png'],
    folder:'qlchovay'
});
const uploadCloud = multer({storage});
module.exports= uploadCloud;