var myMD = require('../model/LoansProfile.Model');
var usermodel = require('../model/User.Model');
const excelJs = require("exceljs");
const bcrypt =  require('bcrypt');
var msg = '';
const cloudinary = require('cloudinary').v2;
const PDFDocument = require("pdfkit");
const { isPhoneNumber, isValidEmail, isNumber, isDate } = require('../public/javascripts/validation');

exports.list = async(req,res, next) =>{
    let page = parseInt(req.params.i);
    let perPage = parseInt(req.query.data_tables) ||5;
    let searchLoands = null;

    const searchTerm = req.query.searchLoands || '';
    const regex =  new RegExp(searchTerm, 'i');
    
    if(searchTerm !== ''){
        searchLoands = {
            $or: [
                {_id: {$regex : regex} }
            ]
        };
    }
    let start =  (page -1) * perPage;

    const by = req.query.by || '_id';
    const order = req.query.order || 'asc';

    let list =  await myMD.loansProfileModel.find(searchLoands).populate('id_user').skip(start).limit(perPage).sort({[by] : order});


    let totalLoan = await myMD.loansProfileModel.find(searchLoands).populate('id_user').countDocuments();
    let currentPageTotal = start + list.length;

    let countlist = await myMD.loansProfileModel.find(searchLoands).populate('id_user');
    let count = countlist.length / perPage;
    count = Math.ceil(count);

    res.render('loan/list.ejs', { perPage: perPage, currentPage: page, listLoan: list, countPage: count, req: req, by: by, order: order, totalLoan: totalLoan, currentPageTotal: currentPageTotal, start: start });
};

exports.getLoandDetail = async (req, res, next) => {
  try {
    const loandId = req.params.loandId;
    const userDetail = await myMD.loansProfileModel.findById(loandId);
    res.json(userDetail); // Trả về thông tin chi tiết của nhân viên dưới dạng JSON
} catch (error) {
    console.error('Lỗi khi lấy thông tin nhân viên:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy thông tin nhân viên' });
}
};

exports.in = async (req, res, next) => {
    try {
      let workbook = new excelJs.Workbook();
      const sheet = workbook.addWorksheet("User");
      sheet.columns = [
        {
          header: "Mã Phiếu vay",
          key: "_id",
          width: 10,
          style: { alignment: { horizontal: "center" } },
        },
        {
          header: "Mã khách hàng",
          key: "id_user",
          width: 30,
          style: { alignment: { horizontal: "center" } },
        },
          {
            header: "Ngày bắt đầu",
            key: "dateStart",
            width: 20,
            style: { alignment: { horizontal: "center" } },
          },
          {
            header: "Tổng số tháng vay",
            key: "thang",
            width: 15,
            style: { alignment: { horizontal: "center" } },
          },
          {
            header: "Tiền khách hàng vay",
            key: "money",
            width: 20,
            style: { alignment: { horizontal: "center" } },
          },
          {
            header: "Tổng tiền lãi",
            key: "profit",
            width: 15,
            style: { alignment: { horizontal: "center" } },
          },
          {
            header: "Tổng cả gốc lẫn lãi",
            key: "totalmoney",
            width: 30,
            style: { alignment: { horizontal: "center" } },
          },
        {
          header: "Trạng thái",
          key: "status",
          width: 20,
          style: { alignment: { horizontal: "center" } },
        },
    
         
      ];
      const loands = await myMD.loansProfileModel.find({});
      // Thêm dữ liệu người dùng vào bảng Excel
      loands.forEach((loands) => {
        sheet.addRow({
          _id: loands._id,
          id_user: loands.id_user,
          dateStart: loands.dateStart,
          thang: loands.thang,
          money: loands.money,
          profit: loands.profit,
          totalmoney: loands.totalmoney,
          status: loands.status,
       
        });
      });
  
      // Định dạng header để in đậm
      sheet.getRow(1).font = { bold: true };
  
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment;filename=" + "Phieuvay.xlsx"
      );
      // Ghi workbook vào response để tải xuống
      await workbook.xlsx.write(res);
    } catch (error) {
      console.log(error);
    }
  };
  
  exports.print = async (req, res, next) => {
    try {
      const loands = await myMD.userModel.find({});
      // Tạo một tệp PDF mới
      const doc = new PDFDocument();
      const pdfFileName = "DanhSach.pdf";
      // Thiết lập tiêu đề tệp PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${pdfFileName}"`
      );
  
      // Ghi dữ liệu người dùng vào tệp PDF
      doc.pipe(res);
  
      doc.fontSize(20).text("Danh sách khách hàng", { align: "center" });
      doc.moveDown(1);
  
      // Xuất danh sách người dùng
      loands.forEach((loands) => {
        doc.fontSize(14).text(`MPV: ${loands._id}`);
        doc.fontSize(12).text(`MKH: ${loands.id_user}`);
        doc.fontSize(12).text(`Date Start: ${loands.dateStart}`);
        doc.fontSize(12).text(`Number Month: ${loands.thang}`);
        doc.fontSize(12).text(`Borrow Money: ${loands.money}`);
        doc.fontSize(13).text(`Profit: ${loands.profit}`);
        doc.fontSize(14).text(`Total Money: ${loands.totalmoney}`);
        doc.fontSize(12).text(`Status: ${loands.status}`);
        doc.moveDown(1);
      });
  
      // Kết thúc tệp PDF
      doc.end();
    } catch (error) {
      console.log(error);
      res.status(500).send("Đã xảy ra lỗi trong quá trình in dữ liệu.");
      return;
    }
  };

 
  const userModel = require('../model/User.Model');
  
  exports.add = async (req, res, next) => {
      let msg = '';
      const formData = req.body;
  
      if (req.method === 'POST') {
          try {
              // Kiểm tra xem khách hàng có tồn tại không
              const existingCustomer = await userModel.userModel.find({ id_user: req.body.id_user });
              
              if (!existingCustomer) {
                  msg = "Không tìm thấy khách hàng";
                  return res.render('loan/add.ejs', { req: req, msg: msg, formData: formData });
              }
  
              // Tạo một phiếu vay mới
              const newLoan = new myMD.loansProfileModel({
                  id_user: req.body.id_user,
                  dateStart: req.body.dateStart,
                  thang: req.body.thang,
                  money: req.body.money,
                  status: 'Chưa hoàn thành'
              });
  
              // Tính toán profit và totalmoney dựa trên số tháng vay
              if (newLoan.thang === 3) {
                  newLoan.profit = newLoan.money * 3 / 100;
              } else if (newLoan.thang === 6) {
                  newLoan.profit = newLoan.money * 6 / 100;
              } else if (newLoan.thang === 9) {
                  newLoan.profit = newLoan.money * 9 / 100;
              } else if (newLoan.thang === 12) {
                  newLoan.profit = newLoan.money * 12 / 100;
              }
  
              newLoan.totalmoney = newLoan.money + newLoan.profit;
  
              // Lưu phiếu vay mới vào CSDL
              await newLoan.save();
              msg = "Thêm thành công";
          } catch (err) {
            console.log(err); // Ghi log lỗi để xem thông tin lỗi
            msg = "Đã xảy ra lỗi khi thêm phiếu vay: " + err.message; // Hiển thị thông báo lỗi chi tiết
            console.error('Lỗi khi thực hiện truy vấn:', err);
          }
      }
  
      res.render('loan/add.ejs', { req: req, msg: msg, formData: formData });
  };

exports.edit = async (req, res, next) => {
    let msg = '';
    let idLoand = req.params.id;
    let objLoand = await myMD.loansProfileModel.findById(idLoand);

    if (req.method === 'POST') {
       
        if(!isPhoneNumber(req.body.phone)){
          msg = "Số điện thoại không hợp lệ.";
          return   res.render('loan/edit.ejs', { msg: msg, objLoand: objLoand, req: req });
        }
        try {
            objLoand.id_user = req.body.id_user;
            objLoand.dateStart = req.body.dateStart;
            objLoand.thang = req.body.thang;
            objLoand.status = req.body.status;
            objLoand.money = req.body.money;
            if(thang == 3){
              objLoand.profit = objLoand.money * 3/100
            }else if(thang == 6){
              objLoand.profit = objLoand.money * 6/100
            }   else if(thang == 9){
              objLoand.profit = objLoand.money * 9/100
            }   else if(thang == 12){
              objLoand.profit = objLoand.money * 12/100
            }
            objLoand.totalmoney = objLoand.money + objLoand.profit  
            await myMD.loansProfileModel.findByIdAndUpdate(idLoand, objLoand);
            msg = 'Cập Nhật Thành Công';
        } catch (error) {
            msg = 'Lỗi Ghi CSDL: ' + error.message;
            console.log(error);
        }
    }

    res.render('loan/edit.ejs', { msg: msg, objLoand: objLoand, req: req });
};

// delete
exports.deleteLoand = async (req, res, next) => {
    msg = '';
    try {
      await myMD.loansProfileModel.deleteOne({_id: req.body.IdDelete});
      msg = 'Xóa thành công' 
      res.redirect('/loand/1');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  };