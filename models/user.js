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
    domain: { type: [{ type: String, unique: true }], default: [] }, // Array de strings únicas para os domínios
    accountType: {
        type: String,
        enum: ['bronze', 'silver', 'gold'],
        default: 'bronze' // Tipo de conta padrão
    },
    domainsLimit: {
        type: Number,
        default: 1, // Limite padrão para conta bronze
        validate: {
            validator: function(value) {
                if (this.accountType === 'bronze') {
                    return value === 1;
                } else if (this.accountType === 'silver') {
                    return value === 3;
                } else if (this.accountType === 'gold') {
                    return value === 5;
                }
                return false;
            },
            message: 'Limite de domínios inválido para o tipo de conta'
        }
    }
});

module.exports = mongoose.model('User', userSchema);