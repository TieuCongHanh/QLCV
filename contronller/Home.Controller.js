const md = require('../model/Staff.Model');

const bcrypt = require('bcrypt');
var msg = '';
exports.home = async (req, res, next) => {
   
   return res.render('home/home.ejs',{ req });
};
exports.Login = async (req, res, next) => {
    let msg = '';
    const adminUser = await md.staffModel.findOne({ role: 'Admin' });
    if (req.method == 'POST') {
        try {
            const { username, password } = req.body;
            const user1 = await md.staffModel.findOne({ username });
            if (!user1) {
                return res.render('home/dn.ejs', { msg: 'Tài khoản không đúng vui lòng đăng nhập lại.', req: req , adminUser : adminUser});
            } else {
            
                // So sánh mật khẩu đã băm
                const passwordMatch = await bcrypt.compare(password, user1.password);
                if (!passwordMatch) {
                    return res.render('home/dn.ejs', { msg: 'Bạn nhập sai mật khẩu vui lòng đăng nhập lại.', req: req , adminUser : adminUser});
                } else {
                    // Kiểm tra vaitro của người dùng
                    // if (user1.role !== 'Admin') {
                    //     return res.render('home/dn.ejs', { msg: 'Bạn không có quyền đăng nhập.', req: req , adminUser : adminUser});
                    // }
                    
                    req.session.staffLogin = user1;
                    return res.render('home/home.ejs',{ req });
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    return res.render('home/dn.ejs', { msg: msg, req: req , adminUser : adminUser});
};

const vietnamesePhoneNumberRegex = /(0[1-9][0-9]{8})\b/;
exports.Reg = async (req, res, next) => {
    let msg = '';
    const adminUser = await md.staffModel.findOne({ role: 'Admin' });
    if (adminUser) {
        return res.redirect('/');
    }
    const existingUser = await md.staffModel.findOne({ username: req.body.username });
    
    if (req.method === 'POST') {

        if (!req.body.username || !req.body.password || !req.body.fullname || !req.body.email 
            || !req.body.phone) {
            msg = 'Vui lòng điền đầy đủ thông tin.';
            return res.render('home/dk.ejs', { msg: msg });
        }
        if (existingUser) {
            msg = 'Tài khoản đã tồn tại. Vui lòng chọn tên đăng nhập khác.';
            return res.render('home/dk.ejs', { msg: msg });
        }

        if (req.body.password !== req.body.passwd2) {
            msg = 'Xác nhận mật khẩu không trùng khớp.';
            return res.render('home/dk.ejs', { msg: msg });
        }  // Kiểm tra định dạng số điện thoại
        if (!vietnamesePhoneNumberRegex.test(req.body.phone)) {
            msg = 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.';
            return res.render('home/dk.ejs', { msg: msg });
        }
            try {
                let objU = new md.staffModel();
                objU.username = req.body.username;
                objU.password = req.body.password;
                objU.email = req.body.email;
                objU.role = req.body.role;
               
                const salt = await bcrypt.genSalt(10);
                objU.password = await bcrypt.hash(req.body.password, salt);
                objU.fullname = req.body.fullname;
                
                objU.phone = req.body.phone;
                objU.SoCCCD = req.body.SoCCCD;
                objU.addressold = req.body.addressold;
                objU.addresnew = req.body.addresnew;
                objU.gender = req.body.gender;
                objU.birthday = req.body.birthday;
              

                await objU.save();
                msg = 'Đăng ký thành công.';

            } catch (error) {
                msg = error.message;
            }
        }
    
    res.render('home/dk.ejs', { msg: msg });
};


exports.Logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/');
        }
      });
}
