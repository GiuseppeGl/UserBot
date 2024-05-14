const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Definizione delle classi e della factory method

// Interfaccia FileLoader
class FileLoader {
  loadFile(source) {
    throw new Error('Metodo non implementato');
  }
}

// Classe Concrete LocalFileLoader
class LocalFileLoader extends FileLoader {
  loadFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject('Errore durante la lettura del file locale');
        } else {
          resolve(data);
        }
      });
    });
  }
}

// Classe Concrete RemoteFileLoader
class RemoteFileLoader extends FileLoader {
  loadFile(url) {
    return new Promise((resolve, reject) => {
      axios.get(url)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject('Errore durante il caricamento del file remoto');
        });
    });
  }
}

// Factory Method per creare l'oggetto FileLoader appropriato in base alla sorgente
function createFileLoader(source) {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return new RemoteFileLoader();
  } else {
    return new LocalFileLoader();
  }
}

// Configurazione di Multer per gestire il caricamento del file
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Gestore della richiesta POST '/analyze'
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
