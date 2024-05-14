const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione di Multer per gestire il caricamento del file
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/analyze', upload.single('file'), async (req, res) => {
  let data;
  
  if (req.file) {
    // Se è stato caricato un file, leggi il file locale
    const filePath = req.file.path;
    data = fs.readFileSync(filePath, 'utf8');
  } else if (req.body.url) {
    // Se è stato inviato un URL, scarica il contenuto dall'URL
    try {
      const response = await axios.get(req.body.url);
      data = response.data;
    } catch (error) {
      return res.status(500).send('Errore durante il recupero del file dall\'URL');
    }
  } else {
    return res.status(400).send('Devi fornire un URL o caricare un file');
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

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
