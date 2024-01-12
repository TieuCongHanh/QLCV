var db = require('./db');
const userSchema = new db.mongoose.Schema(
    {
        _id : {type: db.mongoose.Schema.Types.String},
        fullname : {type: String, require: true},
        email:{type:String, require:true},
        phone:{type:Number, require:true},
        SoCCCD:{type:Number, require:true},
        image:{type:String , require:true},
        addressold:{type:String,require:true},
        addresnew:{type:String,require:true},
        gender:{type:String,require:true},
        birthday:{type:String,require:true},
    },
    {
        collection: 'User'
    }
)
// Middleware "pre" để tự động tăng giá trị _id lên 1 
userSchema.pre('save', function(next){
    const doc = this;
    if(doc.isNew){
        // tìm người dùng có giá trị id lớn nhất 
        userModel.findOne({}, {_id:1 },{ sort: {_id: -1}})
        .then((maxUser) =>{
            // tăng giá trị id lên 1
            const regex = /^KH(\d+)$/;
            const maxIdmatch = regex.exec(maxUser?._id || '');
            const nextId = maxIdmatch ? parseInt(maxIdmatch[1]) +1 : 1;
            const formattedId = "KH" + String(nextId).padStart(3, '0');
            doc._id = formattedId;
            next();
        })
        .catch((error) =>{
            next(error);
        }) ;
    }else{
        next();
    }
})

let userModel = db.mongoose.model('userModel',userSchema);
module.exports = {userModel};