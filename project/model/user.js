var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    secretToken: {
        type: String
    },
    active: {
        type: Boolean
    },
    accessToken: {
        type: String
    },
    userImageUrl: {
        type: {
            type: String
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
        versionKey: false
    }
);

userSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    }
    else {
        return next();
    }
})

userSchema.methods.comparePassword = function (pw, cb) {
    bcrypt.compare(pw, this.password, function (err, isMatch) {
        if (err) {
            return next(err);
        }
        cb(null, isMatch)
    });
}

module.exports = mongoose.model('User', userSchema);
