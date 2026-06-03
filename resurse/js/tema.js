window.addEventListener("DOMContentLoaded", function() {
    let temaCurenta = localStorage.getItem("tema_aleasa") || "light";
    
    let btnSwitch = document.getElementById('btn-schimba-tema');
    let iconTema = document.getElementById('icon-tema');

    function schimbaTema(nouaTema) {
        document.body.classList.remove("dark-theme", "ocean-theme", "forest-theme");
        document.documentElement.classList.remove("dark-theme", "ocean-theme", "forest-theme");
        document.documentElement.removeAttribute('data-bs-theme');
        
        if (nouaTema !== "light") {
            document.body.classList.add(nouaTema);
            document.documentElement.classList.add(nouaTema);
            if (nouaTema === 'dark-theme') document.documentElement.setAttribute('data-bs-theme', 'dark');
        }
        
        localStorage.setItem("tema_aleasa", nouaTema);

        let radio = document.querySelector(`input[name="tema_site"][value="${nouaTema}"]`);
        if (radio) radio.checked = true;

        if (btnSwitch) btnSwitch.checked = (nouaTema === 'dark-theme');
        if (iconTema) iconTema.className = (nouaTema === 'dark-theme') ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }

    let radioTeme = document.querySelectorAll('input[name="tema_site"]');
    for (let r of radioTeme) {
        if (r.value === temaCurenta) r.checked = true;
        r.addEventListener("change", function() { if (this.checked) schimbaTema(this.value); });
    }

    if (btnSwitch) {
        btnSwitch.checked = (temaCurenta === 'dark-theme');
        if (iconTema) iconTema.className = (temaCurenta === 'dark-theme') ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        btnSwitch.addEventListener('change', function() { schimbaTema(this.checked ? 'dark-theme' : 'light'); });
    }
    
    schimbaTema(temaCurenta);
});