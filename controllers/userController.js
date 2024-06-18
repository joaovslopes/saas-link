// controllers/userController.js
const User = require('../models/user');
const validator = require('validator');

// Função para registrar um novo usuário
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Por favor, preencha todos os campos necessários' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ msg: 'Formato de email inválido' });
    }

    if (password.length < 6) {
        return res.status(400).json({ msg: 'A senha deve ter pelo menos 6 caracteres' });
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'Email já cadastrado' });
        }

        user = new User({ name, email, password });

        await user.save();

        res.status(201).json({ msg: 'Usuário registrado com sucesso', accountId: user.accountId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// Função para adicionar um domínio ao usuário
exports.addDomain = async (req, res) => {
    const { accountId, domain } = req.body;

    if (!accountId || !domain) {
        return res.status(400).json({ msg: 'Por favor, forneça o accountId e o domínio' });
    }

    try {
        let user = await User.findOne({ accountId });

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }

        if (user.domain.length >= user.domainsLimit) {
            return res.status(400).json({ msg: 'Limite de domínios excedido para sua conta' });
        }

        const existingDomain = await User.findOne({ domain });

        if (existingDomain) {
            return res.status(400).json({ msg: 'Este domínio já está registrado' });
        }

        user.domain.push(domain);
        await user.save();

        res.status(200).json({ msg: 'Domínio adicionado com sucesso' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};
