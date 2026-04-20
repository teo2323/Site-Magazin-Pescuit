const express = require('express');
const app = express();

const fs = require('fs'); 
const path = require('path');

const vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
        console.log(`Folderul "${folder}" a fost creat.`);
    } else {
        console.log(`Folderul "${folder}" există deja.`);
    }
}

let obGlobal = {
    obErori: null
};

function initErori() {
    try {
        const continutJson = fs.readFileSync(__dirname + "/erori.json", "utf8");
        obGlobal.obErori = JSON.parse(continutJson);

        obGlobal.obErori.info_erori.forEach(eroare => {
            eroare.imagine = obGlobal.obErori.cale_baza + eroare.imagine;
        });
        obGlobal.obErori.eroare_default.imagine = obGlobal.obErori.cale_baza + obGlobal.obErori.eroare_default.imagine;
        
        console.log("Erorile au fost încărcate cu succes.");
    } catch (e) {
        console.error("EROARE CRITICĂ: Nu s-a putut încărca sau parsa erori.json!");
        console.error("Detalii eroare:", e.message);
        process.exit(1); 
    }
}

initErori(); 
function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroareGasita = obGlobal.obErori.info_erori.find(e => e.identificator === identificator);
    
    if (!eroareGasita) {
        eroareGasita = obGlobal.obErori.eroare_default;
    }

    let titluFinal = titlu || eroareGasita.titlu;
    let textFinal = text || eroareGasita.text;
    let imagineFinala = imagine || eroareGasita.imagine;

    res.render("pagini/eroare", {
        titlu: titluFinal,
        text: textFinal,
        imagine: imagineFinala
    }, (err, html) => {
        let statusCod = (eroareGasita.status) ? identificator : 200;
        
        if (err) {
            res.status(500).send("Eroare critică: Nu s-a putut randa pagina de eroare.");
        } else {
            res.status(statusCod).send(html);
        }
    });
}

app.set('view engine', 'ejs');
app.use('/resurse', express.static(__dirname + '/resurse'));


app.get("/favicon.ico", (req, res) => {
    res.sendFile(__dirname + "/resurse/imagini/favicon/favicon.ico");
});

app.get(/^\/resurse(\/.*)?$/, (req, res) => {
    afisareEroare(res, 403);
});

app.get(["/", "/index", "/home"], (req, res) => {
    res.render("pagini/index", {ip: req.ip});
});

app.get(/\.ejs$/, (req, res) => {
    afisareEroare(res, 400);
});

app.get("/:nume_pagina", (req, res) => {
    let numePagina = req.params.nume_pagina; 

    res.render("pagini/" + numePagina,{ip: req.ip}, function(eroare, rezultatRandare) {
        if (eroare) {
            if (eroare.message.startsWith("Failed to lookup view")) {
                afisareEroare(res, 404);
            } else {
                afisareEroare(res, 500, "Eroare Internă", "Ne cerem scuze, a apărut o problemă la procesarea paginii.");
            }
        } else {
            res.send(rezultatRandare);
        }
    });
});


const PORT = 8080;

console.log("Calea folderului (index.js):", __dirname);
console.log("Calea fișierului:", __filename);
console.log("Folderul curent de lucru:", process.cwd());

app.listen(PORT, () => {
    console.log(`Serverul a pornit la adresa http://localhost:${PORT}`);
});