const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const domainSchema = new Schema({
    accountId: {
        type: String,
        required: true
    },
    domains: {
        type: [{
            type: String,
            unique: true
        }],
        default: []
    }
});

module.exports = mongoose.model('Domain', domainSchema);
