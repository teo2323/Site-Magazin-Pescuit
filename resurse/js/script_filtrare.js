window.onload = function() {
    const K = 6;

    let produseSterse = JSON.parse(sessionStorage.getItem("produse_sterse")) || [];
    for (let id of produseSterse) {
        let elem = document.getElementById(id);
        if (elem) elem.remove();
    }

    let modal = document.getElementById("produs-modal");
    let spanClose = document.querySelector(".close-modal");
    if (modal && spanClose) {
        spanClose.addEventListener("click", function() {
            modal.style.display = "none";
        });
        window.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }); 
    }

    let articole = document.getElementsByClassName("produs");
    let idx = 0;
    for (let art of articole) {
        art.dataset.index = idx++;

        art.addEventListener("click", function(e) {
            if (e.target.closest('.actiuni-produs')) return;
            if (e.target.closest('.btn-detalii')) return;

            let modalBody = document.getElementById("modal-body");
            if (modal && modalBody) {
                let clona = art.cloneNode(true);
                clona.removeAttribute("id");
                let actiuni = clona.querySelector('.actiuni-produs');
                if (actiuni) actiuni.remove();
                clona.style.display = "block";
                clona.style.border = "none";
                clona.style.boxShadow = "none";
                modalBody.innerHTML = "";
                modalBody.appendChild(clona);
                modal.style.display = "block";
            }
        });

        let btnPin = art.querySelector(".btn-pin");
        if (btnPin) {
            btnPin.onclick = function() {
                art.classList.toggle("produs-pastrat");
                btnPin.classList.toggle("btn-primary");
                btnPin.classList.toggle("btn-outline-primary");
                filtreazaProduse();
            };
        }

        let btnHide = art.querySelector(".btn-hide");
        if (btnHide) {
            btnHide.onclick = function() {
                art.classList.remove("filtrat");
                art.style.display = "none";
                let articoleVizibile = Array.from(document.getElementsByClassName("produs")).filter(a => a.classList.contains("filtrat"));
                renderPaginare(articoleVizibile, 1);
                let afisate = articoleVizibile.length;
                let mesajLipsa = document.getElementById("mesaj-lipsa-produse");
                if (mesajLipsa) mesajLipsa.style.display = afisate === 0 ? "block" : "none";
            };
        }

        let btnDelete = art.querySelector(".btn-delete");
        if (btnDelete) {
            btnDelete.onclick = function() {
                let idArt = art.id;
                let sterse = JSON.parse(sessionStorage.getItem("produse_sterse")) || [];
                if (!sterse.includes(idArt)) {
                    sterse.push(idArt);
                    sessionStorage.setItem("produse_sterse", JSON.stringify(sterse));
                }
                art.remove();
                filtreazaProduse();
            };
        }
    }

    let inpDd = document.getElementById("inp-dd");
    if (inpDd) {
        let minDd = parseFloat(inpDd.min);
        if (isNaN(minDd)) minDd = 0;
        let maxDd = parseFloat(inpDd.max);
        if (isNaN(maxDd)) maxDd = 0;

        inpDd.value = maxDd;
        
        if (document.getElementById("dd-min")) {
            document.getElementById("dd-min").innerHTML = minDd;
        }
        if (document.getElementById("dd-max")) {
            document.getElementById("dd-max").innerHTML = maxDd + ' m (<span id="dd-curent">Toate</span>)';
        }
        
        inpDd.onchange = function() {
            if (parseFloat(this.value) === maxDd) {
                document.getElementById("dd-curent").innerHTML = "Toate";
            } else {
                document.getElementById("dd-curent").innerHTML = this.value + " m";
            }
            filtreazaProduse();
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

    function renderPaginare(articoleVizibile, pagina) {
        let paginareContainer = document.getElementById("paginare");
        if (!paginareContainer) return;
        paginareContainer.innerHTML = "";
        
        let N = articoleVizibile.length;
        let NRL = Math.ceil(N / K);
        
        if (NRL <= 1) {
            for (let a of articoleVizibile) {
                a.style.display = "block";
            }
            return;
        }
        
        if (pagina > NRL) pagina = NRL;
        if (pagina < 1) pagina = 1;
        
        for (let i = 0; i < N; i++) {
            if (i >= (pagina - 1) * K && i <= pagina * K - 1) {
                articoleVizibile[i].style.display = "block";
            } else {
                articoleVizibile[i].style.display = "none";
            }
        }
        
        for (let i = 1; i <= NRL; i++) {
            let btn = document.createElement("button");
            btn.className = "btn btn-sm " + (i === pagina ? "btn-primary" : "btn-outline-primary");
            btn.textContent = i;
            btn.onclick = function() {
                renderPaginare(articoleVizibile, i);
            };
            paginareContainer.appendChild(btn);
        }
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

    function filtreazaProduse() {
        if (!valideazaFormular()) return;

        let valNumeBrut = document.getElementById("inp-nume").value.trim();
        let valNume = valNumeBrut.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        let valDd = parseFloat(document.getElementById("inp-dd").value);
        let maxDdPosibil = parseFloat(document.getElementById("inp-dd").max);

        let valRadio = document.querySelector('input[name="gr_radio"]:checked').value;
        let valPromotie = document.getElementById("inp-promotie").checked;
        let valCategorie = document.getElementById("inp-categorie").value;
        
        let optiuniPret = document.getElementById("inp-pret").selectedOptions;
        let valIntervalePret = Array.from(optiuniPret).map(opt => opt.value);
        
        let valDescriereBrut = document.getElementById("inp-descriere").value.trim();
        let valDescriere = valDescriereBrut.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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

        let afisate = 0;
        let articoleVizibile = [];
        let articole = document.getElementsByClassName("produs");
        for (let art of articole) {
            art.style.display = "none";
            
            let numeArt = art.dataset.nume ? art.dataset.nume.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
            let marcaArt = art.dataset.marca ? art.dataset.marca.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
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
            
            let descArt = art.dataset.descriere ? art.dataset.descriere.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
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

        let isPinned = art.classList.contains("produs-pastrat");

        if (isPinned || (condNume && condDd && condRadio && condPromotie && condCategorie && condPret && condDescriere)) {
                articoleVizibile.push(art);
                art.classList.add("filtrat");
                afisate++;
            } else {
                art.classList.remove("filtrat");
            }
        }
        
        renderPaginare(articoleVizibile, 1);

        let grid = document.querySelector(".produse-grid");
        let mesajLipsa = document.getElementById("mesaj-lipsa-produse");
        if (!mesajLipsa) {
            mesajLipsa = document.createElement("div");
            mesajLipsa.id = "mesaj-lipsa-produse";
            mesajLipsa.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Nu există produse conform filtrării curente.';
            mesajLipsa.className = "alert alert-warning w-100 fs-5";
            mesajLipsa.style.gridColumn = "1 / -1";
            mesajLipsa.style.textAlign = "center";
            mesajLipsa.style.fontWeight = "bold";
            grid.appendChild(mesajLipsa);
        }
        mesajLipsa.style.display = afisate === 0 ? "block" : "none";
    }

    document.getElementById("btn-filtrare").onclick = filtreazaProduse;

    let inpNumeFiltru = document.getElementById("inp-nume");
    if (inpNumeFiltru) inpNumeFiltru.addEventListener("change", filtreazaProduse);

    let inpDescriereFiltru = document.getElementById("inp-descriere");
    if (inpDescriereFiltru) inpDescriereFiltru.addEventListener("change", filtreazaProduse);

    let inpCategorieFiltru = document.getElementById("inp-categorie");
    if (inpCategorieFiltru) inpCategorieFiltru.addEventListener("change", filtreazaProduse);

    let inpPretFiltru = document.getElementById("inp-pret");
    if (inpPretFiltru) inpPretFiltru.addEventListener("change", filtreazaProduse);

    let inpPromotieFiltru = document.getElementById("inp-promotie");
    if (inpPromotieFiltru) inpPromotieFiltru.addEventListener("change", filtreazaProduse);

    let radioGrupFiltru = document.querySelectorAll('input[name="gr_radio"]');
    for (let r of radioGrupFiltru) {
        r.addEventListener("change", filtreazaProduse);
    }

    let selSort1 = document.getElementById("cheie-sortare-1");
    let selSort2 = document.getElementById("cheie-sortare-2");
    function updateSortSelects() {
        if (!selSort1 || !selSort2) return;
        let val1 = selSort1.value;
        let val2 = selSort2.value;
        for (let opt of selSort2.options) {
            let hidden = (opt.value === val1);
            opt.style.display = hidden ? "none" : "";
            opt.disabled = hidden;
        }
        for (let opt of selSort1.options) {
            let hidden = (opt.value === val2);
            opt.style.display = hidden ? "none" : "";
            opt.disabled = hidden;
        }
    }
    if (selSort1) selSort1.addEventListener("change", updateSortSelects);
    if (selSort2) selSort2.addEventListener("change", updateSortSelects);
    updateSortSelects();

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
        inpDd.value = parseFloat(inpDd.max);
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
        
        let selSort1 = document.getElementById("cheie-sortare-1");
        if (selSort1) selSort1.selectedIndex = 0;
        let selSort2 = document.getElementById("cheie-sortare-2");
        if (selSort2) selSort2.selectedIndex = 0;
        
        updateSortSelects();
        
        let grid = document.querySelector(".produse-grid");
        let articoleArray = Array.from(document.getElementsByClassName("produs"));
        
        articoleArray.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
        
        for (let art of articoleArray) {
            grid.appendChild(art);     
        }
        
        filtreazaProduse();
    }
    
    function sorteaza(semn) {
        if (!valideazaFormular()) return;

        let articole = Array.from(document.getElementsByClassName("produs"));
        let grid = document.querySelector(".produse-grid");
        
        let sel1 = document.getElementById("cheie-sortare-1");
        let sel2 = document.getElementById("cheie-sortare-2");
        let cheie1 = sel1 ? sel1.value : "pret";
        let cheie2 = sel2 ? sel2.value : "greutate";
        
        articole.sort(function(a, b) {
            let valA1 = a.dataset[cheie1];
            let valB1 = b.dataset[cheie1];
            let valA2 = a.dataset[cheie2];
            let valB2 = b.dataset[cheie2];
            
            let compara = function(v1, v2) {
                if (!v1) v1 = "";
                if (!v2) v2 = "";
                let n1 = parseFloat(v1);
                let n2 = parseFloat(v2);
                if (!isNaN(n1) && !isNaN(n2)) return n1 - n2;
                return v1.localeCompare(v2);
            };
            
            let cmp1 = compara(valA1, valB1);
            if (cmp1 !== 0) return semn * cmp1;
            return semn * compara(valA2, valB2);
        });
        
        for (let art of articole) {
            grid.appendChild(art);
        }
        
        filtreazaProduse();
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
            if (art.classList.contains("filtrat")) {
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
            }, 2000);
        }
    }
    
    filtreazaProduse();
}
