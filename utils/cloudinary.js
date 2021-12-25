const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadToCloudinary = (image) => {
  return cloudinary.uploader
    .upload(image)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader
    .destroy(publicId)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
