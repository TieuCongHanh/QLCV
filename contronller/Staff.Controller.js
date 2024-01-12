var myMD = require('../model/Staff.Model');
const excelJs = require("exceljs");
const bcrypt =  require('bcrypt');
var msg = '';
const cloudinary = require('cloudinary').v2;
const PDFDocument = require("pdfkit");
const { isPhoneNumber, isValidEmail, isNumber } = require('../public/javascripts/validation');

exports.list = async(req,res, next) =>{
    let page = parseInt(req.params.i);
    let perPage = parseInt(req.query.data_tables) ||5;
    let searchStaff = null;

    const searchTerm = req.query.searchStaff || '';
    const regex =  new RegExp(searchTerm, 'i');
    
    if(searchTerm !== ''){
        searchStaff = {
            $or: [
                {_id: {$regex : regex} },
                {username : {$regex : regex}},
                {fullname : {$regex : regex}},
                {email : {$regex : regex}},
            ]
        };
    }

    let start =  (page -1) * perPage;

    const by = req.query.by || '_id';
    const order = req.query.order || 'asc';

    let list =  await myMD.staffModel.find(searchStaff).skip(start).limit(perPage).sort({[by] : order});
    let totalStaff = await myMD.staffModel.find(searchStaff).countDocuments();
    let currentPageTotal = start + list.length;

    let countlist = await myMD.staffModel.find(searchStaff);
    let count = countlist.length / perPage;
    count = Math.ceil(count);

    res.render('staff/list.ejs', { perPage: perPage, currentPage: page, listStaff: list, countPage: count, req: req, by: by, order: order, totalStaff: totalStaff, currentPageTotal: currentPageTotal, start: start });
};

exports.getStaffDetail = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const staffDetail = await myMD.staffModel.findById(userId);
    res.json(staffDetail); // Trả về thông tin chi tiết của nhân viên dưới dạng JSON
} catch (error) {
    console.error('Lỗi khi lấy thông tin nhân viên:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy thông tin nhân viên' });
}
};

exports.in = async (req, res, next) => {
    try {
      let workbook = new excelJs.Workbook();
      const sheet = workbook.addWorksheet("Staff");
      sheet.columns = [
        {
          header: "Mã nhân viên",
          key: "_id",
          width: 10,
          style: { alignment: { horizontal: "center" } },
        },
        {
          header: "Họ tên",
          key: "fullname",
          width: 30,
          style: { alignment: { horizontal: "center" } },
        },
        {
          header: "Tên đăng nhập",
          key: "username",
          width: 40,
          style: { alignment: { horizontal: "center" } },
        },
        {
            header: "Vai trò",
            key: "role",
            width: 20,
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
          header: "So CCCD",
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
      const staffs = await myMD.staffModel.find({});
      // Thêm dữ liệu người dùng vào bảng Excel
      staffs.forEach((staffs) => {
        sheet.addRow({
          _id: staffs._id,
          fullname: staffs.fullname,
          username: staffs.username,
          role: staffs.role,
          email: staffs.email,
          phone: staffs.phone,
          SoCCCD: staffs.SoCCCD,
    
          addressold: staffs.addressold,
          addresnew: staffs.addresnew,
          gender: staffs.gender,
          birthday: staffs.birthday,
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
        "attachment;filename=" + "nhanvien.xlsx"
      );
      // Ghi workbook vào response để tải xuống
      await workbook.xlsx.write(res);
    } catch (error) {
      console.log(error);
    }
  };
  
  exports.print = async (req, res, next) => {
    try {
      const staffs = await myMD.staffModel.find({});
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
  
      doc.fontSize(20).text("Danh sách nhân viên", { align: "center" });
      doc.moveDown(1);
  
      // Xuất danh sách người dùng
      staffs.forEach((staffs) => {
        doc.fontSize(14).text(`MNV: ${staffs._id}`);
        doc.fontSize(12).text(`Full name: ${staffs.fullname}`);
        doc.fontSize(12).text(`User name: ${staffs.username}`);
        doc.fontSize(12).text(`Role: ${staffs.role}`);
        doc.fontSize(12).text(`Email: ${staffs.email}`);;
        doc.fontSize(12).text(`Phone: ${staffs.phone}`);;
        doc.fontSize(12).text(`Number CCCD: ${staffs.SoCCCD}`);;
        doc.fontSize(12).text(`Address old: ${staffs.addressold}`);
        doc.fontSize(12).text(`Address new: ${staffs.addresnew}`);
        doc.fontSize(12).text(`Gender: ${staffs.gender}`);
        doc.fontSize(12).text(`Birthday: ${staffs.birthday}`);
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
    const hasNewImage = true;
    if (req.method == 'POST') {
        const existingStaff = await myMD.staffModel.findOne({ username: req.body.username });
      
        if (existingStaff) {
            msg = "Nhân viên đã tồn tại.";
            return res.render('staff/add.ejs', { req: req, msg: msg , formData:formData, next:next, hasNewImage: hasNewImage});
        }

        if(!isPhoneNumber(req.body.phone)){
          msg = "Số điện thoại không hợp lệ.";
          return res.render('staff/add.ejs', { req: req, msg: msg , formData:formData, next:next, hasNewImage: hasNewImage});
        }
        if(!isValidEmail(req.body.email)){
          msg = "Email không hợp lệ.";
          return res.render('staff/add.ejs', { req: req, msg: msg , formData:formData, next:next, hasNewImage: hasNewImage});
        }
        if(!isNumber(req.body.SoCCCD)){
            msg = "Số CCCD không hợp lệ.";
            return res.render('staff/add.ejs', { req: req, msg: msg , formData:formData, next:next, hasNewImage: hasNewImage});
        }
        const birthDate = new Date(req.body.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18 || age > 50) {
            msg = "Tuổi phải từ 18 đến 50 để thêm nhân viên.";
            return res.render('staff/add.ejs', { req: req, msg: msg, formData: formData, next: next, hasNewImage: hasNewImage });
        }
            try {
                let url_file = ''; 
                if (req.file != undefined) {
                    url_file = req.file.path;
                    hasNewImage = false;
                }

                const objStaff = new myMD.staffModel();
                objStaff.username = req.body.username;
                objStaff.fullname = req.body.fullname;
                objStaff.role = req.body.role;
                objStaff.image = url_file;
                objStaff.addressold = req.body.addressold;
                objStaff.addresnew = req.body.addresnew;
                objStaff.phone = req.body.phone;
                objStaff.SoCCCD = req.body.SoCCCD;
                objStaff.gender = req.body.gender;
                objStaff.password = req.body.password;
                objStaff.email = req.body.email;
                objStaff.birthday = req.body.birthday;
                
                const salt = await bcrypt.genSalt(10);
                objStaff.password = await bcrypt.hash(req.body.password, salt);
               
                 await objStaff.save();
                msg = "Thêm thành công";
            } catch (err) {
                console.log(err);
            }
    }
    return   res.render('staff/add.ejs', { req: req, msg: msg , formData:formData, next:next, hasNewImage: hasNewImage});
};


exports.edit = async (req, res, next) => {
    let msg = '';
    let idStaff = req.params.id;
    let objStaff = await myMD.staffModel.findById(idStaff);

    if (req.method === 'POST') {
       
        if(!isPhoneNumber(req.body.phone)){
          msg = "Số điện thoại không hợp lệ.";
          return   res.render('staff/edit.ejs', { msg: msg, objStaff: objStaff, req: req });
        }
        if(!isValidEmail(req.body.email)){
          msg = "Email không hợp lệ.";
          return   res.render('staff/edit.ejs', { msg: msg, objStaff: objStaff, req: req });
        }
        if(!isNumber(req.body.SoCCCD)){
            msg = "Số CCCD không hợp lệ.";
              return   res.render('staff/edit.ejs', { msg: msg, objStaff: objStaff, req: req });
        }

        try {
            objStaff.username = req.body.username;
            objStaff.fullname = req.body.fullname;
            objStaff.role = req.body.role;
            objStaff.birthday = req.body.birthday;
            objStaff.addressold = req.body.addressold;
            objStaff.addresnew = req.body.addresnew;
            objStaff.phone = req.body.phone;
            objStaff.SoCCCD = req.body.SoCCCD;
            objStaff.gender = req.body.gender;
        
            objStaff.email = req.body.email;
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                objStaff.password = await bcrypt.hash(req.body.password, salt);
            } else {
                objStaff.password = objStaff.password;
            }
            
                if (req.file != undefined) {
                      const publicId = getPublicIdFromUrl(objStaff.image);
                      cloudinary.uploader.destroy(publicId, (error, result) => {
                        if (error) {
                            console.log("Xóa ảnh khỏi Cloudinary không thành công!");
                        } else {
                            console.log("Xóa ảnh khỏi Cloudinary thành công!");
                        }
                    });
                    objStaff.image = req.file.path;
                }else{
                  objStaff.image = objStaff.image;
                }

               
            

            await myMD.staffModel.findByIdAndUpdate(idStaff, objStaff);
            msg = 'Cập Nhật Thành Công';
        } catch (error) {
            msg = 'Lỗi Ghi CSDL: ' + error.message;
            console.log(error);
        }
    }

    res.render('staff/edit.ejs', { msg: msg, objStaff: objStaff, req: req });
};

// delete
exports.deleteStaff = async (req, res, next) => {
    msg = '';
    try {
      await myMD.staffModel.deleteOne({_id: req.body.IdDelete});
      msg = 'Xóa thành công' 
      res.redirect('/staff/1');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  };