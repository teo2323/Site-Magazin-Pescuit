const fs = require('fs');
let content = fs.readFileSync('index.js', 'utf8');

const oldStr = `app.get("/produse", async (req, res) => {
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
});`;

const newStr = `app.get("/produse", async (req, res) => {
    try {
        const enumResult = await pool.query("SELECT unnest(enum_range(NULL::tip_echipament)) AS categorie");
        const categorii = enumResult.rows.map(row => row.categorie);

        const marciResult = await pool.query("SELECT DISTINCT marca FROM produse WHERE marca IS NOT NULL ORDER BY marca");
        const marci = marciResult.rows.map(row => row.marca);

        const ddResult = await pool.query("SELECT MIN(dd_maxim) as min_dd, MAX(dd_maxim) as max_dd FROM produse");
        const min_dd = ddResult.rows[0].min_dd || 0;
        const max_dd = ddResult.rows[0].max_dd || 10;

        const subcatResult = await pool.query("SELECT DISTINCT tip_pescuit FROM produse WHERE tip_pescuit IS NOT NULL ORDER BY tip_pescuit");
        const subcategorii = subcatResult.rows.map(row => row.tip_pescuit);

        const pretResult = await pool.query("SELECT MIN(pret) as min_pret, MAX(pret) as max_pret FROM produse");
        const min_pret = pretResult.rows[0].min_pret || 0;
        const max_pret = pretResult.rows[0].max_pret || 1000;

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
            marci: marci,
            min_dd: min_dd,
            max_dd: max_dd,
            subcategorii: subcategorii,
            min_pret: min_pret,
            max_pret: max_pret,
            ip: req.ip
        });
    } catch (err) {
        console.error('Eroare la extragerea produselor:', err);
        afisareEroare(res, 500, "Eroare baza de date", "A apărut o eroare la interogarea produselor.");
    }
});`;

if (content.includes(oldStr)) {
    fs.writeFileSync('index.js', content.replace(oldStr, newStr));
    console.log('Successfully updated index.js');
} else {
    console.log('Old string not found!');
}
