/********************************************************************
 * server.js - Node/Express backend para Angular 20
 ********************************************************************/
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos do Angular
app.use(express.static(path.join(__dirname, 'dist/advanced-farms/browser')));

// Endpoint de API para produtos
app.get('/api/produtos', (req, res) => {
  // Substitua este array por integração real com MySQL se quiser
  const produtos = [
    { id: 1, title: 'Produto 1', preco: 100, imagem: '/assets/prod1.jpg' },
    { id: 2, title: 'Produto 2', preco: 200, imagem: '/assets/prod2.jpg' },
    { id: 3, title: 'Produto 3', preco: 300, imagem: '/assets/prod3.jpg' },
  ];
  res.json(produtos);
});

// Rota curinga para Angular
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/advanced-farms/browser', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Node/Express rodando em http://localhost:${PORT}`);
});
