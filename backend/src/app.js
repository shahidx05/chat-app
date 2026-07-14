const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const app = express()

app.use(cors({origin: "http://localhost:5173",credentials: true}));
app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

module.exports = app