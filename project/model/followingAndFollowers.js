var mongoose = require("mongoose");
var followingAndFollowersSchema = new mongoose.Schema({
    user_id: String,
    followers: [],
    following: []

})
module.exports = mongoose.model('FollowingAndFollowers', FollowingAndFollowersSchema);