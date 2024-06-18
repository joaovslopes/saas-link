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

        // Criar novo usuário
        const newUser = new User({ name, email, password, domain: [] }); // Inicializa domain como um array vazio
        await newUser.save();

        // Se foi fornecido um domainName na requisição, adiciona o domínio para o usuário
        if (domainName) {
            // Verificar se o usuário já atingiu o limite de domínios
            const hasReachedDomainLimit = checkDomainLimit(newUser);
            if (hasReachedDomainLimit) {
                await newUser.remove(); // Remove o usuário criado para evitar inconsistências
                return res.status(400).json({ msg: 'Limite de domínios atingido para este tipo de conta.' });
            }

            // Verificar se o domínio já está registrado para qualquer usuário
            const existingDomain = await Domain.findOne({ domainName });
            if (existingDomain) {
                await newUser.remove(); // Remove o usuário criado para evitar inconsistências
                return res.status(400).json({ msg: 'Este domínio já está registrado.' });
            }

            // Cria o novo domínio
            const newDomain = new Domain({ accountId: newUser.accountId, domainName });
            await newDomain.save();

            // Atualiza a lista de domínios no usuário
            newUser.domain.push(domainName);
            await newUser.save();
        }

        // Retornar sucesso com accountId
        res.status(201).json({ msg: 'Usuário registrado com sucesso', accountId: newUser.accountId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};
const checkDomainLimit = (user) => {
    if (user.accountType === 'bronze' && user.domain.length >= 1) {
        return user.domain.length >= 1;
    } else if (user.accountType === 'silver' && user.domain.length >= 3) {
        return user.domain.length >= 3;
    } else if (user.accountType === 'gold' && user.domain.length >= 5) {
        return user.domain.length >= 5;
    }
    return false;
};

// Adicionar domínio para um usuário
exports.addDomain = async (req, res) => {
    const { accountId } = req.body; // trocar para params depois
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

        // Verificar se o domínio já está registrado para qualquer outro usuário
        const domainExists = await User.findOne({ domain: domainName });
        if (domainExists && domainExists.accountId !== accountId) {
            return res.status(400).json({ error: 'Este domínio já está registrado para outro usuário.' });
        }

        // Verificar se o domínio já está registrado para este usuário
        if (user.domain.includes(domainName)) {
            return res.status(400).json({ error: 'Este domínio já está registrado para este usuário.' });
        }

        // Adicionar o domínio ao usuário
        user.domain.push(domainName);
        await user.save();

        res.status(201).json({ message: 'Domínio adicionado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar o domínio.' });
    }
};