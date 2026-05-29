window.onload = function() {
    let articole = document.getElementsByClassName("produs");
    let idx = 0;
    for (let art of articole) {
        art.dataset.index = idx++;
    }

    if (articole.length > 0) {
        let maxDd = 0;
        let minDd = 999999;
        let hasDd = false;
        
        for (let art of articole) {
            let ddStr = art.dataset.dd;
            if (ddStr !== "") {
                hasDd = true;
                let dd = parseFloat(ddStr);
                if (dd > maxDd) maxDd = dd;
                if (dd < minDd) minDd = dd;
            }
        }
        
        if (!hasDd) {
            minDd = 0;
            maxDd = 10; 
        } else if (minDd === maxDd) {
            minDd = 0; 
        }
        
        let inpDd = document.getElementById("inp-dd");
        inpDd.min = minDd;
        inpDd.max = maxDd;
        inpDd.value = maxDd;
        
        document.getElementById("dd-min").innerHTML = minDd;
        document.getElementById("dd-max").innerHTML = maxDd + ' m (<span id="dd-curent">Toate</span>)';
        
        inpDd.onchange = function() {
            if (parseFloat(this.value) === maxDd) {
                document.getElementById("dd-curent").innerHTML = "Toate";
            } else {
                document.getElementById("dd-curent").innerHTML = this.value + " m";
            }
        }
        inpDd.oninput = function() {
            if (parseFloat(this.value) === maxDd) {
                document.getElementById("dd-curent").innerHTML = "Toate";
            } else {
                document.getElementById("dd-curent").innerHTML = this.value + " m";
            }
        }
    }

    let inpDescRealtime = document.getElementById("inp-descriere");
    if (inpDescRealtime) {
        inpDescRealtime.addEventListener("input", function() {
            let valDesc = this.value.trim();
            if (valDesc !== "") {
                let tokens = valDesc.split(/\s+/);
                let validTokens = tokens.every(t => /^[\+\-][a-zA-Z0-9ăîâșțĂÎÂȘȚ\-]+$/.test(t));
                if (validTokens) {
                    this.classList.remove("is-invalid");
                }
            } else {
                this.classList.remove("is-invalid");
            }
        });
    }

    function valideazaFormular() {
        let isValid = true;
        let mesaje = [];
        
        let inpNume = document.getElementById("inp-nume");
        let valNume = inpNume ? inpNume.value.trim() : "";
        if (inpNume && valNume !== "" && !/^[a-zA-Z0-9\s\-ăîâșțĂÎÂȘȚ]+$/.test(valNume)) {
            isValid = false;
            inpNume.style.border = "2px solid red";
            mesaje.push("- Câmpul 'Nume / Marca' conține caractere invalide (sunt permise doar litere, cifre, spații și cratime).");
        } else if (inpNume) {
            inpNume.style.border = "";
        }

        let inpDesc = document.getElementById("inp-descriere");
        let valDesc = inpDesc ? inpDesc.value.trim() : "";
        if (inpDesc && valDesc !== "") {
            let tokens = valDesc.split(/\s+/);
            let validTokens = tokens.every(t => /^[\+\-][a-zA-Z0-9ăîâșțĂÎÂȘȚ\-]+$/.test(t));
            if (!validTokens) {
                isValid = false;
                inpDesc.classList.add("is-invalid");
                mesaje.push("- Câmpul 'Cuvinte cheie' este invalid. Fiecare cuvânt trebuie să înceapă cu '+' sau '-' și să nu conțină spații sau simboluri în interior (ex: +vobler -știucă).");
            } else {
                inpDesc.classList.remove("is-invalid");
            }
        } else if (inpDesc) {
            inpDesc.classList.remove("is-invalid");
        }

        let radioSelectat = document.querySelector('input[name="gr_radio"]:checked');
        let radioGroup = document.querySelector('.radio-group');
        if (!radioSelectat) {
            isValid = false;
            if (radioGroup) {
                radioGroup.style.border = "2px solid red";
                radioGroup.style.padding = "5px";
            }
            mesaje.push("- Trebuie să selectezi o opțiune pentru 'Tip pescuit'.");
        } else {
            if (radioGroup) {
                radioGroup.style.border = "";
                radioGroup.style.padding = "";
            }
        }

        if (!isValid) {
            alert("Vă rugăm să remediați următoarele probleme înainte de a continua:\n\n" + mesaje.join("\n"));
        }
        
        return isValid;
    }

    document.getElementById("btn-filtrare").onclick = function() {
        if (!valideazaFormular()) return;

        let valNume = document.getElementById("inp-nume").value.trim().toLowerCase();
        
        let valDd = parseFloat(document.getElementById("inp-dd").value);
        let maxDdPosibil = parseFloat(document.getElementById("inp-dd").max);

        let valRadio = document.querySelector('input[name="gr_radio"]:checked').value;
        let valPromotie = document.getElementById("inp-promotie").checked;
        let valCategorie = document.getElementById("inp-categorie").value;
        
        let optiuniPret = document.getElementById("inp-pret").selectedOptions;
        let valIntervalePret = Array.from(optiuniPret).map(opt => opt.value);
        
        let valDescriere = document.getElementById("inp-descriere").value.trim().toLowerCase();
        let cuvintePlus = [];
        let cuvinteMinus = [];
        if (valDescriere) {
            let tokens = valDescriere.split(/\s+/);
            for (let t of tokens) {
                if (t.startsWith('+') && t.length > 1) {
                    cuvintePlus.push(t.substring(1));
                } else if (t.startsWith('-') && t.length > 1) {
                    cuvinteMinus.push(t.substring(1));
                }
            }
        }

        let articole = document.getElementsByClassName("produs");
        for (let art of articole) {
            art.style.display = "none";
            
            let numeArt = art.dataset.nume;
            let marcaArt = art.dataset.marca;
            let condNume = (valNume === "" || numeArt.includes(valNume) || marcaArt.includes(valNume));
            
            let condDd = false;
            let ddArtStr = art.dataset.dd;
            if (valDd === maxDdPosibil) {
                condDd = true;
            } else {
                if (ddArtStr !== "") {
                    let ddArt = parseFloat(ddArtStr);
                    condDd = ddArt <= valDd;
                } else {
                    condDd = false; 
                }
            }
            
            let subcatArt = art.dataset.subcategorie;
            let condRadio = (valRadio === "toate" || valRadio === subcatArt);
            
            let promoArt = (art.dataset.promotie === "true");
            let condPromotie = valPromotie ? promoArt : true;
            
            let catArt = art.dataset.categorie;
            let condCategorie = (valCategorie === "toate" || valCategorie === catArt);
            
            let pretArt = parseFloat(art.dataset.pret);
            let condPret = false;
            if (valIntervalePret.length === 0) {
                condPret = true;
            } else {
                for (let interval of valIntervalePret) {
                    let parts = interval.split('-');
                    let pMin = parseFloat(parts[0]);
                    let pMax = parseFloat(parts[1]);
                    if (pretArt >= pMin && pretArt <= pMax) {
                        condPret = true;
                        break;
                    }
                }
            }
            
            let descArt = art.dataset.descriere || "";
            let condPlus = cuvintePlus.length === 0; 
            if (cuvintePlus.length > 0) {
                for (let cp of cuvintePlus) {
                    if (descArt.includes(cp)) {
                        condPlus = true;
                        break;
                    }
                }
            }
            
            let condMinus = true;
            for (let cm of cuvinteMinus) {
                if (descArt.includes(cm)) {
                    condMinus = false;
                    break;
                }
            }
            let condDescriere = condPlus && condMinus;

            if (condNume && condDd && condRadio && condPromotie && condCategorie && condPret && condDescriere) {
                art.style.display = "block";
            }
        }
    }

    document.getElementById("btn-reset").onclick = function() {
        if (!confirm("Ești sigur că dorești să resetezi toate filtrele și să revii la ordinea inițială?")) {
            return;
        }

        let inpNume = document.getElementById("inp-nume");
        inpNume.value = "";
        inpNume.style.border = "";
        
        let inpDesc = document.getElementById("inp-descriere");
        inpDesc.value = "";
        inpDesc.classList.remove("is-invalid");

        let inpDd = document.getElementById("inp-dd");
        inpDd.value = inpDd.max;
        document.getElementById("dd-curent").innerHTML = "Toate";
        
        document.querySelector('input[name="gr_radio"][value="toate"]').checked = true;
        let radioGroup = document.querySelector('.radio-group');
        radioGroup.style.border = "";
        radioGroup.style.padding = "";
        
        document.getElementById("inp-promotie").checked = false;
        
        document.getElementById("inp-categorie").value = "toate";
        
        let optiuniPret = document.getElementById("inp-pret").options;
        for (let opt of optiuniPret) {
            opt.selected = false;
        }
        
        let grid = document.querySelector(".produse-grid");
        let articoleArray = Array.from(document.getElementsByClassName("produs"));
        
        articoleArray.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
        
        for (let art of articoleArray) {
            art.style.display = "block"; 
            grid.appendChild(art);     
        }
    }
    
    function sorteaza(semn) {
        if (!valideazaFormular()) return;

        let articole = Array.from(document.getElementsByClassName("produs"));
        let grid = document.querySelector(".produse-grid");
        
        articole.sort(function(a, b) {
            let pretA = parseFloat(a.dataset.pret);
            let pretB = parseFloat(b.dataset.pret);
            if (pretA !== pretB) {
                return semn * (pretA - pretB);
            }
            
            let greutateA = parseFloat(a.dataset.greutate) || 0;
            let greutateB = parseFloat(b.dataset.greutate) || 0;
            return semn * (greutateA - greutateB);
        });
        
        for (let art of articole) {
            grid.appendChild(art);
        }
    }

    document.getElementById("btn-sort-asc").onclick = function() {
        sorteaza(1);
    }
    document.getElementById("btn-sort-desc").onclick = function() {
        sorteaza(-1);
    }

    window.onkeydown = function(e) {
        if (e.key === 'c' && e.altKey) {
            if (!valideazaFormular()) return;
            calculSuma();
        }
    }
    document.getElementById("btn-calc").onclick = function() {
        if (!valideazaFormular()) return;
        calculSuma();
    }

    function calculSuma() {
        let articole = document.getElementsByClassName("produs");
        let suma = 0;
        let afisate = 0;
        
        for (let art of articole) {
            if (art.style.display !== "none") {
                suma += parseFloat(art.dataset.pret);
                afisate++;
            }
        }
        
        if (!document.getElementById("info-suma")) {
            let info = document.createElement("div");
            info.id = "info-suma";
            info.innerHTML = "S-au găsit " + afisate + " produse, suma: " + suma.toFixed(2) + " RON";
            info.style.position = "fixed";
            info.style.bottom = "20px";
            info.style.right = "20px";
            info.style.backgroundColor = "#28a745";
            info.style.color = "white";
            info.style.padding = "15px";
            info.style.borderRadius = "8px";
            info.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
            info.style.zIndex = "1000";
            document.body.appendChild(info);
            
            setTimeout(function() {
                let elem = document.getElementById("info-suma");
                if(elem) elem.remove();
            }, 3000);
        }
    }
}
