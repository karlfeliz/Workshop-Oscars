// Imports/require
const express = require("express");
const fs = require("fs");

// Parametros del servidor, router y los datos de origen
const PORT = 3000;
const server = express();
const router = express.Router();
const dataFilePath = "./data";
const homeFilePath = "./home.html";

//  Configuracion de Router para servidores que tengan rutas con parametros.PONER SIEMPRE QUE HAY PARAMS.
server.use(express.json());
// Que entienda los json
server.use(express.urlencoded({ extended: false }));
// Entiende mejor los params de las rutas

// GET oscars

router.get("/oscars", (req, res) => {
  fs.readdir(dataFilePath, (error, data) => {
    //  Leemos el fichero//
    if (error) {
      //  Si hay error al leer el fichero ... envio codigo 500 y un mensaje
      res.status(500).send("Error inesperado");
    } else {
      const years = [];
      data.forEach((file) => {
        years.push(parseInt(file.slice(7, 11)));
      });
      const allYears = {
        years,
      };
      res.json(allYears);
    }
  });
});

// GET oscars/year

router.get("/oscars/:year", (req, res) => {
  const year = parseInt(req.params.year);
  fs.readdir(dataFilePath, (error, data) => {
    //  Leemos el fichero//
    if (error) {
      //  Si hay error al leer el fichero ... envio codigo 500 y un mensaje
      res.status(500).send("Error inesperado");
    } else {
      const years = [];
      data.forEach((file) => {
        years.push(parseInt(file.slice(7, 11)));
      });
    }
  });
  fs.readFile(dataFilePath + `/oscars-${year}.json`, (error, data) => {
    //  Leemos el fichero//
    if (error) {
      //  Si hay error al leer el fichero ... envio codigo 500 y un mensaje
      res.status(500).send("Error inesperado");
    } else {
      //  Si no hay error al leer el fichero ...
      const jsonData = JSON.parse(data.toString());
      res.json(jsonData);
    }
  });
});

// POST oscars/year

router.post("/oscars/:year", (req, res) => {
  const year = parseInt(req.params.year);
  let awards = [];
  const filePath = dataFilePath + `/oscars-${year}.json`;
  console.log("Entra en POST");
  //  Leemos el fichero//
  fs.readFile(filePath, (error, data) => {
    // No existe el archivo
    if (error) {
      console.log("No existe el fichero, se crea uno nuevo");
      fs.writeFile(filePath, JSON.stringify(awards), (error) => {
        if (error) {
          res.status(500).send("Error de escritura");
        } else {
          res.status(200).send("El archivo se ha creado correctamente");
        }
      });
    } else {
      console.log("El archivo existe");
      awards = JSON.parse(data);
      //  Parseamos el json
      const newAward = req.body;
      //  Recogemos la peticion post en el body de la request
      awards.push(newAward);
      //  Lo añadimos a la lista de awards
      // res.json(awards);
      fs.writeFile(filePath, JSON.stringify(awards), (error) => {
        // Ecribimos el fichero con los awards nuevos
        if (error) {
          //   Si hay error ... le envio un código 500 y un mensaje
          res.status(500).send("Error al escribir el archivo");
        } else {
          //  Si no hay error y se ha ecrito correctamente el archivo le devuelvo el newAward
          res.json(awards);
          console.log("Se ha añadido el nuevo premio al archivo");
        }
      });
    }
  });
});

// GET winners-multiple

router.get("/winners-multiple/:year", (req, res) => {
  const year = parseInt(req.params.year);
  const multipleWinners = [];
  const filePath = `${dataFilePath}/oscars-${year}.json`;
  console.log(filePath);
  fs.readFile(filePath, (error, data) => {
    if (error) {
      console.log("Error");
    } else {
      const dataParsed = JSON.parse(data);
      dataParsed.forEach((winner) => {
        const awards = dataParsed.filter((item) => {
          return item.entity === winner.entity;
        });
        if (awards.length > 1) {
          const existingWinner = multipleWinners.find((multipleWinner) => {
            return multipleWinner.name === winner.entity;
          });
          if (!existingWinner) {
            multipleWinners.push({
              name: winner.entity,
              awards
            });
          }
        }
      });
      res.json(multipleWinners);
    }
  });
});

// GET home

router.get("/", (req, res) => {
  fs.readFile(homeFilePath, (error, data) => {
    //  Leemos el fichero//
    if (error) {
      //  Si hay error al leer el fichero ... envio codigo 500 y un mensaje
      res.status(500).send("Error inesperado");
    } else {
      //  Si no hay errores leyendo le devolvemos el html
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.send(data);
    }
  });
});

server.use("/", router);
server.listen(PORT, () => {
  console.log(`Servidor levantado y escuchando en puerto ${PORT}`);
});
