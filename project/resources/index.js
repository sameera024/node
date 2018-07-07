var router = require("express")();
var { ProjectTypeController } = require("./controllers/controller");

module.exports = function () {
    router.use('/projtype', new ProjectTypeController().route());
    return router;
}