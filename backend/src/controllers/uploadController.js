const getFullUrl = (req, filename) => {
  const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({ success: true, data: { url: req.fileUrl, filename: req.file.filename } });
  } catch (error) {
    next(error);
  }
};

exports.uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const files = req.files.map((file) => ({
      url: getFullUrl(req, file.filename),
      filename: file.filename,
    }));
    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
};
