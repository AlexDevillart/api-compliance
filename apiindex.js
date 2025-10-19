const serverless = require("serverless-http");
const app = require("./serverapp");
module.exports = serverless(app);

