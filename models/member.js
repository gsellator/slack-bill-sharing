var mongoose = require('mongoose'),
    q = require('q'),
    Schema = mongoose.Schema,
    model = module.exports;

var MemberSchema = new Schema({
  username: { type: String }
});

mongoose.model('Member', MemberSchema);
var MemberModel = mongoose.model('Member');

//CRUD WelcomePack
model.create = function (member) {
  return q.ninvoke(MemberModel, 'create', member);
};

model.get = function (username) {
  return q.ninvoke(MemberModel, 'findOne', {"username": username});
};

model.getAll = function () {
  return q.ninvoke(MemberModel, 'find', {});
};

model.remove = function (_id) {
  return q.ninvoke(MemberModel, 'remove', {"_id": _id});
};

model.removeByUsername = function (username) {
  return q.ninvoke(MemberModel, 'remove', {"username": username});
};

model.removeAll = function (_id) {
  return q.ninvoke(MemberModel, 'remove', {});
};