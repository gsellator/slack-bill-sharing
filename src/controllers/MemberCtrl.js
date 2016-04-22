import MemberModel from "../models/MemberModel";

const MemberCtrl = {
  create: (req, res) => {
    let member = {
      username: req.body.username
    };
    MemberModel.create(member)
    .then((result) => {
      res.redirect('/admin');
    });
  },

  delete: (req, res) => {
    MemberModel.remove(req.params.id)
    .then((result) => {
      res.redirect('/admin');
    });
  },

  deleteAll: (req, res) => {
    MemberModel.removeAll()
    .then((result) => {
      res.redirect('/admin');
    });
  }
};

export default MemberCtrl;