var db = require('./db');
const LoansProfileSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.String},
        id_user: {type: db.mongoose.Schema.Types.String, ref: 'userModel'},
        dateStart: {type: String, require: true},
        status: {type:String,require:true},
        thang: {type:Number, require: true},
        money:{type:Number,require:true},
        profit:{type:Number,require:true},
        totalmoney:{type:Number,require:true}
    },
    {
        collection: 'LoansProfile'
    }
)


// Middleware "pre" để tự động tăng giá trị _id lên 1 
LoansProfileSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        loansProfileModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxLoans) => {
                // Tăng giá trị ID lên 1
                const regex = /^LP(\d+)$/;
                const maxIdMatch = regex.exec(maxLoans?._id || '');
                const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
                const formattedId = "LP" + String(nextId).padStart(3, '0');
                doc._id = formattedId;
                next();
            })
            .catch((error) => {
                next(error);
            });
    } else {
        next();
    }
});

let loansProfileModel = db.mongoose.model('loansProfileModel', LoansProfileSchema);

module.exports = { loansProfileModel };
