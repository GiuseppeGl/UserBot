const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione di Multer per gestire il caricamento del file
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/analyze', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Errore durante la lettura del file');
    }

    // Effettua l'analisi del file
    const wordCount = data.split(/\s+/).length;
    const letterCount = data.replace(/[^a-zA-Z]/g, '').length;
    const spaceCount = data.split(' ').length - 1;

    const words = data.match(/\b\w+\b/g);
    const wordFrequency = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    const repeatedWords = Object.entries(wordFrequency).filter(entry => entry[1] > 10);

    res.json({ wordCount, letterCount, spaceCount, repeatedWords });
  });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
