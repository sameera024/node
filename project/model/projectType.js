var mongoose = require('mongoose');

var projectTypeSchema = new mongoose.Schema({
    projectTypeName: String,
    imagePath: String
});
module.exports = mongoose.model('ProjType', projectTypeSchema);
//_id: false