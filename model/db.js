const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:%40Admin@dataonline.pu7ch3w.mongodb.net/dataonline?retryWrites=true&w=majority')
.catch((err) =>{
    console.log('lỗi');
    console.log(err);
})
module.exports = {mongoose}