const User = require('../models/user');
const validator = require('validator');

// Função para registrar um novo usuário
exports.registerUser = async (req, res) => {
    const { name, email, password, domainName } = req.body;

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
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Email já cadastrado' });
        }

        // Retornar sucesso com accountId
        res.status(201).json({ msg: 'Usuário registrado com sucesso', accountId: newUser.accountId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};


exports.addDomain = async (req, res) => {
    const { accountId } = req.body; // trocar para params depois
    const { domainName } = req.body;

    try {
        // Verificar se o domínio já está registrado para qualquer outro usuário
        const domainExists = await User.findOne({ domain: domainName });
        if (domainExists && domainExists.accountId !== accountId) {
            return res.status(400).json({ error: 'Este domínio já está registrado para outro usuário.' });
        }
        // Adicionar o domínio ao usuário
        domain.push(domainName);
        await save();

        res.status(201).json({ message: 'Domínio adicionado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar o domínio.' });
    }
};