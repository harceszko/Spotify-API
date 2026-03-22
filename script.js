const clientId = 'f527d200ea71484c87aaecab0cb025ef';
const clientSecret = '6f635a955fbe49929706d382c22a6e83';

async function getToken() {
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await res.json();
    return data.access_token;
}
const homeGomb = document.getElementById('home-gomb');

homeGomb.addEventListener('click', () => {
    inputMezo.value = '';

    document.getElementById('kezdo-oldal-reteg').style.display = 'block';
    document.getElementById('kereses-eredmenyek').style.display = 'none';
});

const inputMezo = document.querySelector('.kereso-sav-keret input');
const eredmenyKontener = document.getElementById('kereses-eredmenyek');

inputMezo.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const kulcsszo = inputMezo.value;
        if (!kulcsszo) return;
        document.getElementById('kezdo-oldal-reteg').style.display = 'none';
        document.getElementById('kereses-eredmenyek').style.display = 'block';
        const token = await getToken();
        const res = await fetch(`https://api.spotify.com/v1/search?q=${kulcsszo}&type=artist,track,album&limit=8`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();

        megjelenitEredmenyeket(data);
    }
});

function megjelenitEredmenyeket(data) {
    const kontener = document.getElementById('kereses-eredmenyek');
    kontener.innerHTML = '';

    const felsoResz = document.querySelector('.felso-resz-minta').cloneNode(true);
    
    const elsoEloado = data.artists.items[0];
    felsoResz.querySelector('.legjobb-kep').src = elsoEloado.images[0]?.url || '';
    felsoResz.querySelector('.legjobb-nev').innerText = elsoEloado.name;

    const dalLista = felsoResz.querySelector('.dal-lista-kontener');
    const negyDal = data.tracks.items.slice(0, 4);

    negyDal.forEach(dal => {
        const dalSor = document.querySelector('.dal-sor-minta').cloneNode(true);
        
        dalSor.querySelector('.dal-kep').src = dal.album.images[0].url;
        dalSor.querySelector('.dal-cim').innerText = dal.name;
        dalSor.querySelector('.dal-eloado').innerText = dal.artists[0].name;
        
        const perc = Math.floor(dal.duration_ms / 60000);
        const mp = Math.floor((dal.duration_ms % 60000) / 1000).toString().padStart(2, '0');
        dalSor.querySelector('.dal-ido').innerText = perc + ":" + mp;
        
        dalLista.appendChild(dalSor);
    });
    kontener.appendChild(felsoResz);

    const eloadoCim = document.createElement('h2');
    eloadoCim.innerText = "Előadók";
    kontener.appendChild(eloadoCim);

    const eloadoRacs = document.createElement('div');
    eloadoRacs.className = 'racs';
    kontener.appendChild(eloadoRacs);

    const tobbiEloado = data.artists.items.slice(1, 9);
    tobbiEloado.forEach(eloado => {
        const kartya = document.querySelector('.kartya-minta').cloneNode(true);
        kartya.classList.add('kerek-kep');
        
        kartya.querySelector('.kartya-kep').src = eloado.images[0]?.url || '';
        kartya.querySelector('.kartya-cim').innerText = eloado.name;
        kartya.querySelector('.kartya-alcim').innerText = 'Előadó';
        
        eloadoRacs.appendChild(kartya);
    });

    const albumCim = document.createElement('h2');
    albumCim.innerText = "Albumok";
    kontener.appendChild(albumCim);

    const albumRacs = document.createElement('div');
    albumRacs.className = 'racs';
    kontener.appendChild(albumRacs);

    data.albums.items.forEach(album => {
        const kartya = document.querySelector('.kartya-minta').cloneNode(true);
        
        kartya.querySelector('.kartya-kep').src = album.images[0].url;
        kartya.querySelector('.kartya-cim').innerText = album.name;
        
        const ev = album.release_date.split('-')[0];
        kartya.querySelector('.kartya-alcim').innerText = ev + " • " + album.artists[0].name;
        
        albumRacs.appendChild(kartya);
    });
}
async function betoltKezdolapAPIval() {
    const token = await getToken();

    const dalRes = await fetch(`https://api.spotify.com/v1/search?q=year:2024-2025&type=track&limit=8`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const dalAdat = await dalRes.json();
    megjelenitRacsba(dalAdat.tracks.items, 'felkapott-dalok-racs', false, true);

    const eloadoResz = await fetch(`https://api.spotify.com/v1/search?q=year:2024&type=artist&limit=8`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const eloadoAdat = await eloadoResz.json();
    megjelenitRacsba(eloadoAdat.artists.items, 'nepszeru-eloadok-racs', true, false);

    const drakeRes = await fetch(`https://api.spotify.com/v1/search?q=artist:Drake&type=album&limit=8`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const drakeAdat = await drakeRes.json();
    megjelenitRacsba(drakeAdat.albums.items, 'drake-radio-racs', false, false);

    const weekndRes = await fetch(`https://api.spotify.com/v1/search?q=artist:The Weeknd&type=album&limit=8`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const weekndAdat = await weekndRes.json();
    megjelenitRacsba(weekndAdat.albums.items, 'weeknd-reflektor-racs', false, false);
}

function megjelenitRacsba(lista, kontenerId, kerekLegyen, dalE) {
    const kontener = document.getElementById(kontenerId);
    if (!kontener) return;
    kontener.innerHTML = ''; 

    lista.forEach(elem => {
        const kartya = document.querySelector('.kartya-minta').cloneNode(true);
        
        let kepUrl = dalE ? elem.album.images[0]?.url : elem.images[0]?.url;
        kartya.querySelector('.kartya-kep').src = kepUrl || 'https://via.placeholder.com/150';
        
        if (kerekLegyen) kartya.classList.add('kerek-kep');
        
        kartya.querySelector('.kartya-cim').innerText = elem.name;
        
        if (dalE) {
            kartya.querySelector('.kartya-alcim').innerText = elem.artists[0].name;
        } else {
            kartya.querySelector('.kartya-alcim').innerText = elem.release_date ? elem.release_date.split('-')[0] : 'Előadó';
        }
        
        kontener.appendChild(kartya);
    });
}

betoltKezdolapAPIval();