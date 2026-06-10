import multer from "multer";
import path from "node:path";
import ApiError from "../utils/api.error.js";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads");
//   },

//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const extension = path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + extension);
//   },
// });

const storage = multer.memoryStorage()

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    const allowedFile = ["image/png", "image/jpeg",];

    if (!allowedFile.includes(file.mimetype)) {
      return cb(ApiError.unauthorized("Only JPG, PNG files are allowed"));
    }
    cb(null, true);
  },
});
