const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const repertorioPath = path.join(__dirname, 'repertorio.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Ruta para HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Obtener las canciones
app.get('/canciones', (req, res) => {
  fs.readFileSync(repertorioPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error leyendo el archivo de repertorio');
    }
    const canciones = JSON.parse(data);
    res.json(canciones);
  });
});

// Agregar canción
app.post('/canciones', (req, res) => {
  const nuevaCancion = req.body;
  fs.readFileSync(repertorioPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error leyendo el archivo de repertorio');
    }
    const canciones = JSON.parse(data);
    canciones.push(nuevaCancion);
    fs.writeFileSync(repertorioPath, JSON.stringify(canciones, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error escribiendo en el archivo de repertorio');
      }
      res.status(201).send('Canción agregada');
    });
  });
});

// Actualizar canción existente
app.put('/canciones/:id', (req, res) => {
  const { id } = req.params;
  const nuevaData = req.body;
  fs.readFileSync(repertorioPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error leyendo el archivo de repertorio');
    }
    let canciones = JSON.parse(data);
    const index = canciones.findIndex(c => c.id == id);
    if (index === -1) {
      return res.status(404).send('Canción no encontrada');
    }
    canciones[index] = { ...canciones[index], ...nuevaData };
    fs.writeFileSync(repertorioPath, JSON.stringify(canciones, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error escribiendo en el archivo de repertorio');
      }
      res.send('Canción actualizada');
    });
  });
});

// Eliminar canción
app.delete('/canciones/:id', (req, res) => {
  const { id } = req.params;
  fs.readFileSync(repertorioPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error leyendo el archivo de repertorio');
    }
    let canciones = JSON.parse(data);
    const nuevaLista = canciones.filter(c => c.id != id);
    if (canciones.length === nuevaLista.length) {
      return res.status(404).send('Canción no encontrada');
    }
    fs.writeFileSync(repertorioPath, JSON.stringify(nuevaLista, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error escribiendo en el archivo de repertorio');
      }
      res.send('Canción eliminada');
    });
  });
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
