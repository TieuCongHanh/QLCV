var myMD = require('../model/User.Model');
var loandmodel = require('../model/LoansProfile.Model');
const excelJs = require("exceljs");
const bcrypt =  require('bcrypt');
var msg = '';
const cloudinary = require('cloudinary').v2;
const PDFDocument = require("pdfkit");
const { isPhoneNumber, isValidEmail, isNumber } = require('../public/javascripts/validation');

exports.list = async(req,res, next) =>{
    let page = parseInt(req.params.i);
    let perPage = parseInt(req.query.data_tables) ||5;
    let searchUser = null;

    const searchTerm = req.query.searchUser || '';
    const regex =  new RegExp(searchTerm, 'i');
    
    if(searchTerm !== ''){
        searchUser = {
            $or: [
                {_id: {$regex : regex} },
                {fullname : {$regex : regex}},
                {email : {$regex : regex}},
            ]
        };
    }

    let start =  (page -1) * perPage;

    const by = req.query.by || '_id';
    const order = req.query.order || 'asc';

    let list =  await myMD.userModel.find(searchUser).skip(start).limit(perPage).sort({[by] : order});
    list = await Promise.all(
      list.map(async (user) => {
        const loandList = await loandmodel.loansProfileModel.find({ id_user: user._id });
        return { ...user.toObject(), loandList };
      })
    );

    let totalUser = await myMD.userModel.find(searchUser).countDocuments();
    let currentPageTotal = start + list.length;

    let countlist = await myMD.userModel.find(searchUser);
    let count = countlist.length / perPage;
    count = Math.ceil(count);

    res.render('user/list.ejs', { perPage: perPage, currentPage: page, listUser: list, countPage: count, req: req, by: by, order: order, totalUser: totalUser, currentPageTotal: currentPageTotal, start: start });
};

exports.getUserDetail = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const userDetail = await myMD.userModel.findById(userId);
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
          header: "Mã khách hàng",
          key: "_id",
          width: 10,
          style: { alignment: { horizontal: "center" } },
        },
        {
          header: "Họ và tên",
          key: "fullname",
          width: 30,
          style: { alignment: { horizontal: "center" } },
        },
          {
            header: "Email",
            key: "email",
            width: 20,
            style: { alignment: { horizontal: "center" } },
          },
          {
            header: "Số điện thoại",
            key: "phone",
            width: 15,
            style: { alignment: { horizontal: "center" } },
          },
        {
          header: "Số CCCD",
          key: "SoCCCD",
          width: 20,
          style: { alignment: { horizontal: "center" } },
        },
    
          {
            header: "Địa chỉ quê quán",
            key: "addressold",
            width: 40,
            style: { alignment: { horizontal: "center" } },
          },
          {
            header: "Địa chỉ hiện tại",
            key: "addresnew",
            width: 40,
            style: { alignment: { horizontal: "center" } },
          },
          {
            header: "Giới tính",
            key: "gender",
            width: 30,
            style: { alignment: { horizontal: "center" } },
          },
          {
            header: "Ngày sinh nhật",
            key: "birthday",
            width: 30,
            style: { alignment: { horizontal: "center" } },
          },
      ];
      const users = await myMD.userModel.find({});
      // Thêm dữ liệu người dùng vào bảng Excel
      users.forEach((users) => {
        sheet.addRow({
          _id: users._id,
          fullname: users.fullname,
          email: users.email,
          phone: users.phone,
          SoCCCD: users.SoCCCD,
    
          addressold: users.addressold,
          addresnew: users.addresnew,
          gender: users.gender,
          birthday: users.birthday,
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
        "attachment;filename=" + "khachhang.xlsx"
      );
      // Ghi workbook vào response để tải xuống
      await workbook.xlsx.write(res);
    } catch (error) {
      console.log(error);
    }
  };
  
  exports.print = async (req, res, next) => {
    try {
      const users = await myMD.userModel.find({});
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
      users.forEach((users) => {
        doc.fontSize(14).text(`MKH: ${users._id}`);
        doc.fontSize(12).text(`Full name: ${users.fullname}`);
        doc.fontSize(12).text(`Email: ${users.email}`);
        doc.fontSize(12).text(`Phone: ${users.phone}`);
        doc.fontSize(12).text(`Number CCCD: ${users.SoCCCD}`);
        doc.fontSize(12).text(`Address old: ${users.addressold}`);
        doc.fontSize(12).text(`Address new: ${users.addresnew}`);
        doc.fontSize(12).text(`Gender: ${users.gender}`);
        doc.fontSize(12).text(`Birthday: ${users.birthday}`);
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
  function getPublicIdFromUrl(url) {
    if (!url) {
      return ''; // Nếu url không tồn tại, trả về chuỗi rỗng hoặc giá trị mặc định phù hợp
    }
  
    const startIndex = url.lastIndexOf('/') + 1;
    const endIndex = url.lastIndexOf('.');
    
    if (startIndex >= 0 && endIndex >= 0) {
      return url.substring(startIndex, endIndex);
    } else {
      return ''; // Trường hợp không tìm thấy vị trí gạch chéo hoặc dấu chấm trong url, trả về giá trị mặc định
    }
  }
  
exports.add = async (req, res, next) => {
    msg = "";
    let formData = req.body;
    if (req.method == 'POST') {
        if(!isPhoneNumber(req.body.phone)){
          msg = "Số điện thoại không hợp lệ.";
          return res.render('user/add.ejs', { req: req, msg: msg , formData:formData, next:next});
        }
        if(!isValidEmail(req.body.email)){
          msg = "Email không hợp lệ.";
          return res.render('user/add.ejs', { req: req, msg: msg , formData:formData, next:next});
        }
        if(!isNumber(req.body.SoCCCD)){
            msg = "Số CCCD không hợp lệ.";
            return res.render('user/add.ejs', { req: req, msg: msg , formData:formData, next:next});
        }
        const birthDate = new Date(req.body.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            msg = "Tuổi phải trên 18.";
            return res.render('user/add.ejs', { req: req, msg: msg, formData: formData, next: next});
        }
            try {
                let url_file = ''; 
                if (req.file != undefined) {
                    url_file = req.file.path;

                }else{
                  msg = "Hình ảnh chưa có.";
                  return res.render('user/add.ejs', { req: req, msg: msg, formData: formData, next: next});
                }

                const objUser = new myMD.userModel();
                objUser.fullname = req.body.fullname;
                objUser.image = url_file;
                objUser.addressold = req.body.addressold;
                objUser.addresnew = req.body.addresnew;
                objUser.phone = req.body.phone;
                objUser.SoCCCD = req.body.SoCCCD;
                objUser.gender = req.body.gender;
                objUser.email = req.body.email;
                objUser.birthday = req.body.birthday;              
               
                 await objUser.save();
                msg = "Thêm thành công";
            } catch (err) {
                console.log(err);
            }
    }
    return   res.render('user/add.ejs', { req: req, msg: msg , formData:formData, next:next});
};


exports.edit = async (req, res, next) => {
    let msg = '';
    let idUser = req.params.id;
    let objUser = await myMD.userModel.findById(idUser);

    if (req.method === 'POST') {
       
        if(!isPhoneNumber(req.body.phone)){
          msg = "Số điện thoại không hợp lệ.";
          return   res.render('user/edit.ejs', { msg: msg, objUser: objUser, req: req });
        }
        if(!isValidEmail(req.body.email)){
          msg = "Email không hợp lệ.";
          return   res.render('user/edit.ejs', { msg: msg, objUser: objUser, req: req });
        }
        if(!isNumber(req.body.SoCCCD)){
            msg = "Số CCCD không hợp lệ.";
              return   res.render('user/edit.ejs', { msg: msg, objUser: objUser, req: req });
        }

        try {
   
          objUser.fullname = req.body.fullname;
          objUser.birthday = req.body.birthday;
          objUser.addressold = req.body.addressold;
          objUser.addresnew = req.body.addresnew;
          objUser.phone = req.body.phone;
          objUser.SoCCCD = req.body.SoCCCD;
          objUser.gender = req.body.gender;
        
          objUser.email = req.body.email;
          
            
                if (req.file != undefined) {
                      const publicId = getPublicIdFromUrl(objUser.image);
                      cloudinary.uploader.destroy(publicId, (error, result) => {
                        if (error) {
                            console.log("Xóa ảnh khỏi Cloudinary không thành công!");
                        } else {
                            console.log("Xóa ảnh khỏi Cloudinary thành công!");
                        }
                    });
                    objUser.image = req.file.path;
                }else{
                  objUser.image = objUser.image ;
                }

               
            await myMD.userModel.findByIdAndUpdate(idUser, objUser);
            msg = 'Cập Nhật Thành Công';
        } catch (error) {
            msg = 'Lỗi Ghi CSDL: ' + error.message;
            console.log(error);
        }
    }

    res.render('user/edit.ejs', { msg: msg, objUser: objUser, req: req });
};

// delete
exports.deleteUser = async (req, res, next) => {
    msg = '';
    try {
      await myMD.userModel.deleteOne({_id: req.body.IdDelete});
      msg = 'Xóa thành công' 
      res.redirect('/user/1');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  };