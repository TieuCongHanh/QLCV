exports.yeu_cau_dang_nhap = (req, res, next) => {
    if (req.session.staffLogin) {
        // Thuộc tính 'userLogin' tồn tại trong 'req.session'
        next();
    } else {
        // Không tồn tại thông tin đăng nhập
        // Chuyển hướng tới trang đăng nhập
        res.redirect('/dn');
    }
};

exports.da_dang_nhap =(req, res, next)=>{
    if(req.session.staffLogin){
        // có tồn tại session
        res.redirect('/');
    }else{

        next();
    }
}