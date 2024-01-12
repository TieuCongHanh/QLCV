var express = require('express');
var router = express.Router();
var userCtrl = require('../contronller/User.Controller');
const bodyParser = require('body-parser');
const uploadCloud = require('../middlewares/uploadImage');
var check_login = require('../middlewares/check_login');

router.use(bodyParser.urlencoded({extended:false}));
router.get('/:i',check_login.yeu_cau_dang_nhap, userCtrl.list);
router.get('/', check_login.yeu_cau_dang_nhap,userCtrl.list);

router.get('/:i/user-info/:userId',check_login.yeu_cau_dang_nhap, userCtrl.getUserDetail);
router.get('/user-info/:userId', check_login.yeu_cau_dang_nhap,userCtrl.getUserDetail);

router.get('/:i/add',check_login.yeu_cau_dang_nhap, uploadCloud.single("userImage"), userCtrl.add);
router.post('/:i/add',check_login.yeu_cau_dang_nhap, uploadCloud.single("userImage"), userCtrl.add);

router.get('/:i/in', check_login.yeu_cau_dang_nhap,userCtrl.in);
router.post('/:i/in',check_login.yeu_cau_dang_nhap, userCtrl.in);

router.get('/:i/print',check_login.yeu_cau_dang_nhap, userCtrl.print);
router.post('/:i/print',check_login.yeu_cau_dang_nhap, userCtrl.print);
//edit
router.get('/edit/:id',check_login.yeu_cau_dang_nhap,uploadCloud.single("userImage"), userCtrl.edit);
router.post('/edit/:id',check_login.yeu_cau_dang_nhap,uploadCloud.single("userImage"), userCtrl.edit);

//delete
router.post('/delete',check_login.yeu_cau_dang_nhap,userCtrl.deleteUser);
router.get('/:userId',check_login.yeu_cau_dang_nhap, userCtrl.list);

module.exports = router;
