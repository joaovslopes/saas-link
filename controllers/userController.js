const User = require('../models/user');
const Domain = require('../models/domain');
const validator = require('validator');

// Função para registrar um novo usuário
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validar campos obrigatórios e formato do email
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Por favor, preencha todos os campos necessários' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ msg: 'Formato de email inválido' });
        }

        if (password.length < 6) {
            return res.status(400).json({ msg: 'A senha deve ter pelo menos 6 caracteres' });
        }

        // Verificar se o email já está cadastrado
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Email já cadastrado' });
        }

        // Criar novo usuário
        user = new User({ name, email, password });
        await user.save();

        // Retornar sucesso com accountId
        res.status(201).json({ msg: 'Usuário registrado com sucesso', accountId: user.accountId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};


const checkDomainLimit = (user) => {
    if (user.accountType === 'bronze' && user.domainsLimit >= 1) {
        return user.domainsLimit >= 1;
    } else if (user.accountType === 'silver' && user.domainsLimit >= 3) {
        return user.domainsLimit >= 3;
    } else if (user.accountType === 'gold' && user.domainsLimit >= 5) {
        return user.domainsLimit >= 5;
    }
    return false;
};

// Adicionar domínio para um usuário
exports.addDomain = async (req, res) => {
    const { accountId } = req.body;
    const { domainName } = req.body;

    try {
        // Encontrar usuário pelo accountId
        const user = await User.findOne({ accountId });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Verificar se o usuário já atingiu o limite de domínios
        const hasReachedDomainLimit = checkDomainLimit(user);
        if (hasReachedDomainLimit) {
            return res.status(400).json({ error: 'Limite de domínios atingido para este tipo de conta.' });
        }

        // Verificar se o domínio já está registrado para qualquer usuário
        const existingDomain = await Domain.findOne({ domainName });
        if (existingDomain) {
            return res.status(400).json({ error: 'Este domínio já está registrado.' });
        }

        // Cria o novo domínio
        const newDomain = new Domain({ accountId, domainName });
        await newDomain.save();

        res.status(201).json({ message: 'Domínio adicionado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar o domínio.' });
    }
};
