const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');

const userSchema = new Schema({
    accountId: {
        type: String,
        default: shortid.generate,
        unique: true
    },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: String, default: "none" },
}
);

module.exports = mongoose.model('User', userSchema);