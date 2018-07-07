var baseController = require("./base");
var ProjectType = require("../../model/projectType");
class ProjectTypeController extends baseController {
    constructor() {
        super(ProjectType, '_id');
    }
}

module.exports = {
    ProjectTypeController
};