const express = require('express')
const router = express.Router
const produtoRoutes = require('./routesSaborDigital')

router.get('/', (req,res) => {
    res.json({
        mensagem: 'API Sabor Digital Teste',
        versao: '5.0.8'
    })
})

router.use('/produtos', produtoRoutes)
router.use('/pedidos', produtoRoutes)

module.exports = router