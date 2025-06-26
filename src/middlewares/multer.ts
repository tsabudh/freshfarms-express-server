import multer from "multer";

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "src/localData");
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

multer({
  storage: multerStorage,
});