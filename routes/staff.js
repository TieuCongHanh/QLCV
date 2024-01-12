var express = require('express');
var router = express.Router();
var staffCtrl = require('../contronller/Staff.Controller');
const bodyParser = require('body-parser');
const uploadCloud = require('../middlewares/uploadImage');
var check_login = require('../middlewares/check_login');

router.use(bodyParser.urlencoded({extended:false}));
router.get('/:i',check_login.yeu_cau_dang_nhap, staffCtrl.list);
router.get('/', check_login.yeu_cau_dang_nhap,staffCtrl.list);

router.get('/:i/user-info/:userId',check_login.yeu_cau_dang_nhap, staffCtrl.getStaffDetail);
router.get('/user-info/:userId', check_login.yeu_cau_dang_nhap,staffCtrl.getStaffDetail);

router.get('/:i/add',check_login.yeu_cau_dang_nhap, uploadCloud.single("staffImage"), staffCtrl.add);
router.post('/:i/add',check_login.yeu_cau_dang_nhap, uploadCloud.single("staffImage"), staffCtrl.add);

router.get('/:i/in', check_login.yeu_cau_dang_nhap,staffCtrl.in);
router.post('/:i/in',check_login.yeu_cau_dang_nhap, staffCtrl.in);

router.get('/:i/print',check_login.yeu_cau_dang_nhap, staffCtrl.print);
router.post('/:i/print',check_login.yeu_cau_dang_nhap, staffCtrl.print);
//edit
router.get('/edit/:id',check_login.yeu_cau_dang_nhap,uploadCloud.single("staffImage"), staffCtrl.edit);
router.post('/edit/:id',check_login.yeu_cau_dang_nhap,uploadCloud.single("staffImage"), staffCtrl.edit);

//delete
router.post('/delete',check_login.yeu_cau_dang_nhap,staffCtrl.deleteStaff);
router.get('/:staffId',check_login.yeu_cau_dang_nhap, staffCtrl.list);

module.exports = router;
