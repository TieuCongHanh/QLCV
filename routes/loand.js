var express = require('express');
var router = express.Router();
var loandCtrl = require('../contronller/LoansProfile.Controller');
const bodyParser = require('body-parser');
const uploadCloud = require('../middlewares/uploadImage');
var check_login = require('../middlewares/check_login');

router.use(bodyParser.urlencoded({extended:false}));
router.get('/:i',check_login.yeu_cau_dang_nhap, loandCtrl.list);
router.get('/', check_login.yeu_cau_dang_nhap,loandCtrl.list);

router.get('/:i/loand-info/:loandId',check_login.yeu_cau_dang_nhap, loandCtrl.getLoandDetail);
router.get('/loand-info/:loandId', check_login.yeu_cau_dang_nhap,loandCtrl.getLoandDetail);

router.get('/:i/add',check_login.yeu_cau_dang_nhap, loandCtrl.add);
router.post('/:i/add',check_login.yeu_cau_dang_nhap,  loandCtrl.add);

router.get('/:i/in', check_login.yeu_cau_dang_nhap,loandCtrl.in);
router.post('/:i/in',check_login.yeu_cau_dang_nhap, loandCtrl.in);

router.get('/:i/print',check_login.yeu_cau_dang_nhap, loandCtrl.print);
router.post('/:i/print',check_login.yeu_cau_dang_nhap, loandCtrl.print);
//edit
router.get('/edit/:id',check_login.yeu_cau_dang_nhap, loandCtrl.edit);
router.post('/edit/:id',check_login.yeu_cau_dang_nhap, loandCtrl.edit);

//delete
router.post('/delete',check_login.yeu_cau_dang_nhap,loandCtrl.deleteLoand);
router.get('/:loandId',check_login.yeu_cau_dang_nhap, loandCtrl.list);

module.exports = router;
