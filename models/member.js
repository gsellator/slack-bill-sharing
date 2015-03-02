var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    model = module.exports;

var MemberSchema = new Schema({
  username: { type: String }
});

mongoose.model('Member', MemberSchema);
var MemberModel = mongoose.model('Member');

//CRUD WelcomePack
model.createMember = function (username, callback) {
  var newMember = new MemberModel({
    username: username
  });
  newMember.save(function (err, result) {
    callback(result);
  });
};

model.getMember = function (username, callback) {
  MemberModel.findOne({"username": username}, function (err, result) {
    if (err) { throw err; }
    callback(result);
  });
};

model.getMembers = function (callback) {
  MemberModel.find({}, function (err, result) {
    if (err) { throw err; }
    callback(result);
  });
};

model.deleteMember = function (username, callback) {
  MemberModel.remove({username: username}, function (err, result) {
    if (err) { throw err; }
    callback(result);
  });
};