const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const config = require('./config');

const app = express();

app.use(bodyParser.json());

mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.log(err));

app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
