const {
  WebdavServiceError,
  buildWebdavContext,
} = require("../services/webdavService");

const webdavContext = async (req, res, next) => {
  try {
    const username = req.user?.username;
    req.webdav = await buildWebdavContext(username);
    return next();
  } catch (error) {
    const statusCode = error instanceof WebdavServiceError ? error.statusCode : 500;
    const message =
      error?.message || "We could not prepare WebDAV for this account.";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

module.exports = webdavContext;
