import ExpenseModel from "../models/ExpenseModel";
import MemberModel from "../models/MemberModel";

const AdminCtrl = {
  get: (req, res) => {
    Promise.all([
      MemberModel.getAll(),
      ExpenseModel.getAll()
    ])
    .then((results) => {
      res.render('admin.ejs', {members: results[0], expenses: results[1]});
    });
  }
};

export default AdminCtrl;