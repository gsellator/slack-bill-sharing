import mongoose from "mongoose";

let model = module.exports;

let MemberSchema = new mongoose.Schema({
  username: { type: String }
});

let Member = mongoose.model('Member', MemberSchema);

const MemberModel = {
  create: (member) => {
    return Member.create(member);
  },

  get: (username) => {
    return Member.findOne({"username": username});
  },

  getAll: () => {
    return Member.find({});
  },

  remove: (_id) => {
    return Member.remove({"_id": _id});
  },

  removeByUsername: (username) => {
    return Member.remove({"username": username});
  },

  removeAll: (_id) => {
    return Member.remove({});
  },
};

export default MemberModel;