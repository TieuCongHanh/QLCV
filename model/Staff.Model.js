var db = require('./db');
const staffSchema = new db.mongoose.Schema(
    {
        _id : {type: db.mongoose.Schema.Types.String},
        username : {type: String, require: true},
        fullname : {type: String, require: true},
        role : {type:String, require:true},
        email:{type:String, require:true},
        phone:{type:Number, require:true},
        SoCCCD:{type:Number, require:true},
        image:{type:String , require:true},
        addressold:{type:String,require:true},
        addresnew:{type:String,require:true},
        password:{type:String,require:true},
        gender:{type:String,require:true},
        birthday:{type:String,require:true},
    },
    {
        collection: 'Staff'
    }
)
// Middleware "pre" để tự động tăng giá trị _id lên 1 
staffSchema.pre('save', function(next){
    const doc = this;
    if(doc.isNew){
        // tìm người dùng có giá trị id lớn nhất 
        staffModel.findOne({}, {_id:1 },{ sort: {_id: -1}})
        .then((maxStaff) =>{
            // tăng giá trị id lên 1
            const regex = /^NV(\d+)$/;
            const maxIdmatch = regex.exec(maxStaff?._id || '');
            const nextId = maxIdmatch ? parseInt(maxIdmatch[1]) +1 : 1;
            const formattedId = "NV" + String(nextId).padStart(3, '0');
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

let staffModel = db.mongoose.model('staffModel',staffSchema);
module.exports = {staffModel};