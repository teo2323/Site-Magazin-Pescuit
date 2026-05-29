const express = require('express');
const app = express();
const fs = require('fs'); 
const path = require('path');
global.folderScss = path.join(__dirname, "resurse/scss");
global.folderCss = path.join(__dirname, "resurse/css");

const sass = require('sass'); 

const { Pool } = require('pg');


const pool = new Pool({
    user: 'teo_admin',
    host: 'localhost',
    database: 'magazin_pescuit',
    password: 'admin01',
    port: 5432,
});


pool.connect((err, client, release) => {
    if (err) {
        return console.error('Eroare la conectarea catre PostgreSQL:', err.stack);
    }
    console.log('Conexiunea la baza de date PostgreSQL s-a realizat cu succes!');
    release();
});

 
function compileazaScss(caleScss, caleCss) {
    
    let caleScssAbsoluta = path.isAbsolute(caleScss) 
        ? caleScss 
        : path.join(global.folderScss, caleScss);

    let numeFisierFaraExtensie = path.parse(caleScssAbsoluta).name;

    let caleCssAbsoluta;
    if (!caleCss) {
        caleCssAbsoluta = path.join(global.folderCss, numeFisierFaraExtensie + ".css");
    } else {
        caleCssAbsoluta = path.isAbsolute(caleCss) 
            ? caleCss 
            : path.join(global.folderCss, caleCss);
    }

    if (fs.existsSync(caleCssAbsoluta)) {
        try {
            const numeFisierCss = path.basename(caleCssAbsoluta);
            const directorBackupCss = path.join(__dirname, "backup", "resurse", "css");

            if (!fs.existsSync(directorBackupCss)) {
                fs.mkdirSync(directorBackupCss, { recursive: true });
            }

            fs.copyFileSync(caleCssAbsoluta, path.join(directorBackupCss, numeFisierCss));
            console.log(`[BACKUP] Fișierul vechi "${numeFisierCss}" a fost arhivat.`);
        } catch (err) {
            console.error(`[BACKUP ERROR] Eșec la copierea în backup pentru ${caleCssAbsoluta}:`, err);
        }
    }

    try {
        const rez = sass.compile(caleScssAbsoluta, {
            logger: sass.Logger.silent
        });
        
        let directorCss = path.dirname(caleCssAbsoluta);
        if (!fs.existsSync(directorCss)) {
            fs.mkdirSync(directorCss, { recursive: true });
        }

        fs.writeFileSync(caleCssAbsoluta, rez.css);
        console.log(`[SCSS] Compilare reușită: ${path.basename(caleScssAbsoluta)} -> ${path.basename(caleCssAbsoluta)}`);
    } catch (err) {
        console.error(`[SCSS] Eroare la compilarea fișierului ${caleScssAbsoluta}:`, err);
    }
}


function compilareInitiala() {
    fs.readdir(global.folderScss, (err, fisiere) => {
        if (err) {
            console.error("[SCSS] Eroare la citirea directorului SCSS:", err);
            return;
        }

        fisiere.forEach(fisier => {
            if (fisier.endsWith(".scss")) {
                if (!fisier.startsWith("_")) {
                    compileazaScss(fisier);
                }
            }
        });
    });
}

compilareInitiala();

const sharp = require('sharp');

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

function getAnotimp(data = new Date()) {
    let luna = data.getMonth() + 1; 
    if ([12, 1, 2].includes(luna)) return "iarna";
    if ([3, 4, 5].includes(luna)) return "primavara";
    if ([6, 7, 8].includes(luna)) return "vara";
    return "toamna";
}

let dateGalerie = JSON.parse(fs.readFileSync(path.join(__dirname, 'resurse/json/galerie.json'), 'utf8'));

function proceseazaImagini() {
    const caleAbsoluta = path.join(__dirname, 'resurse/imagini/galerie/');
    const caleMici = path.join(caleAbsoluta, 'mici/');
    const caleMedii = path.join(caleAbsoluta, 'medii/');

    if (!fs.existsSync(caleMici)) fs.mkdirSync(caleMici, { recursive: true });
    if (!fs.existsSync(caleMedii)) fs.mkdirSync(caleMedii, { recursive: true });

    dateGalerie.imagini.forEach(img => {
        let numeFisier = img.cale_fisier;
        let caleSursa = path.join(caleAbsoluta, numeFisier);
        
        sharp(caleSursa)
            .resize(450)
            .jpeg({ quality: 80 })
            .toFile(path.join(caleMedii, numeFisier))
            .catch(err => console.log("Eroare Sharp Medii:", err));

        sharp(caleSursa)
            .resize(300) 
            .jpeg({ quality: 80 })
            .toFile(path.join(caleMici, numeFisier))
            .catch(err => console.log("Eroare Sharp Mici:", err));
    });
}

proceseazaImagini();

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



app.get(["/", "/index", "/home"], (req, res) => {
    let dataCurenta = new Date(); 
    let anotimpCurent = getAnotimp(dataCurenta);

    let imaginiFiltrate = dateGalerie.imagini
        .filter(img => img.anotimp === anotimpCurent)
        .slice(0, 10); 

    res.render("pagini/index", {
        ip: req.ip,
        galerie: imaginiFiltrate,
        caleGalerie: dateGalerie.cale_galerie
    });
});

app.get(/\.ejs$/, (req, res) => {
    afisareEroare(res, 400);
});

app.get("/produse", async (req, res) => {
    try {
        const enumResult = await pool.query("SELECT unnest(enum_range(NULL::tip_echipament)) AS categorie");
        const categorii = enumResult.rows.map(row => row.categorie);

        const tipParam = req.query.tip;
        let produseResult;

        if (tipParam && tipParam !== 'toate') {
            produseResult = await pool.query('SELECT * FROM produse WHERE categorie_mare = $1', [tipParam]);
        } else {
            produseResult = await pool.query('SELECT * FROM produse');
        }

        res.render('pagini/produse', { 
            produse: produseResult.rows, 
            categorii: categorii, 
            ip: req.ip 
        });
    } catch (err) {
        console.error('Eroare la extragerea produselor:', err);
        afisareEroare(res, 500, "Eroare baza de date", "A apărut o eroare la interogarea produselor.");
    }
});

app.get("/produs/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query('SELECT * FROM produse WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return afisareEroare(res, 404, "Produs inexistent", "Produsul cerut nu a fost găsit.");
        }
        res.render('pagini/produs', { produs: result.rows[0], ip: req.ip });
    } catch (err) {
        console.error('Eroare la extragerea produsului:', err);
        afisareEroare(res, 500, "Eroare baza de date", "A apărut o eroare la interogarea produsului.");
    }
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

app.get(/^\/resurse(\/.*)?$/, (req, res) => {
    afisareEroare(res, 403);
});

const PORT = 8080;

console.log("Calea folderului (index.js):", __dirname);
console.log("Calea fișierului:", __filename);
console.log("Folderul curent de lucru:", process.cwd());

app.listen(PORT, () => {
    console.log(`Serverul a pornit la adresa http://localhost:${PORT}`);
});

fs.watch(global.folderScss, (eventType, filename) => {
    if (filename && filename.endsWith(".scss")) {
        if (!filename.startsWith("_")) {
            console.log(`[WATCH] S-a detectat o modificare la: ${filename}`);
            
            compileazaScss(filename);
        }
    }
});

