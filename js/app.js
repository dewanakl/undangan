let isPlay = true;
let token = '';
let audio = new Audio('assets/music/sound.mp3');
const tanggal = '2023-03-15 10:00:00';

const salin = (btn) => {
    navigator.clipboard.writeText(btn.getAttribute('data-nomer').toString());
    btn.innerHTML = 'Tersalin';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = 'Salin No. Rekening';
        btn.disabled = false;
    }, 1500);
};

const timer = () => {
    let countDownDate = new Date(tanggal).getTime();
    let time = null;

    time = setInterval(() => {
        let distance = countDownDate - (new Date().getTime());

        if (distance < 0) {
            clearInterval(time);
            return false;
        } else {
            document.getElementById('hari').innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
            document.getElementById('jam').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById('menit').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('detik').innerText = Math.floor((distance % (1000 * 60)) / 1000);
        }
    }, 1000);
};

const buka = () => {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('tombol-musik').style.display = 'block';
    AOS.init();
    login();
    audio.play();
};

const play = (btn) => {
    if (!isPlay) {
        audio.play();
        isPlay = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
    } else {
        audio.pause();
        isPlay = false;
        btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    }
};

const renderCard = (data) => {
    const DIV = document.createElement('div');
    DIV.classList.add('mb-3');
    DIV.innerHTML = `
    <div class="card-body bg-light shadow p-2 m-0 rounded-3">
        <div class="d-flex flex-wrap justify-content-between align-items-center">
            <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                <strong class="me-1">${data.nama}</strong>${data.hadir ? '<i class="fa-solid fa-circle-check text-success"></i>' : '<i class="fa-solid fa-circle-xmark text-danger"></i>'}
            </p>
            <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${data.created_at}</small>
        </div>
        <hr class="text-dark mt-1 mb-2">
        <p class="text-dark mt-1 mb-0 mx-0 p-0" style="white-space: pre-line">${data.komentar}</p>
    </div>`;
    return DIV;
};

const ucapan = async () => {
    const UCAPAN = document.getElementById('daftarucapan');
    UCAPAN.innerHTML = `<div class="text-center"><span class="spinner-border spinner-border-sm me-1"></span>Loading...</div>`;

    await fetch('https://undangan-api-gules.vercel.app/api/comment')
        .then((res) => res.json())
        .then((res) => {
            if (res.code == 200) {
                UCAPAN.innerHTML = null;
                res.data.forEach((data) => UCAPAN.appendChild(renderCard(data)));

                if (res.data.length == 0) {
                    UCAPAN.innerHTML = `<div class="h6 text-center">Tidak ada data</div>`;
                }
            }
        })
        .catch((err) => alert(err));
};

const login = async () => {
    const UCAPAN = document.getElementById('daftarucapan');
    UCAPAN.innerHTML = `<div class="text-center"><span class="spinner-border spinner-border-sm me-1"></span>Loading...</div>`;

    const REQ = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'user@example.com',
            password: '12345678'
        })
    };

    await fetch('https://undangan-api-gules.vercel.app/api/login', REQ)
        .then((res) => res.json())
        .then((res) => {
            if (res.code == 200) {
                ucapan();
                token = res.data.token;
            }

            if (res.error) {
                alert('Terdapat kesalahan, otomatis reload halaman');
                window.location.reload();
                return;
            }
        })
        .catch(() => {
            alert('Terdapat kesalahan, otomatis reload halaman');
            window.location.reload();
            return;
        });
};

const kirim = async () => {
    let nama = document.getElementById('formnama').value;
    let hadir = document.getElementById('hadiran').value;
    let komentar = document.getElementById('formpesan').value;

    if (token.length == 0) {
        alert('Terdapat kesalahan, otomatis reload halaman');
        window.location.reload();
        return;
    }

    if (nama.length == 0) {
        alert('nama tidak boleh kosong');
        return;
    }

    if (nama.length >= 35) {
        alert('panjangan nama maksimal 35');
        return;
    }

    if (hadir == 0) {
        alert('silahkan pilih kehadiran');
        return;
    }

    if (komentar.length == 0) {
        alert('pesan tidak boleh kosong');
        return;
    }

    document.getElementById('kirim').disabled = true;
    document.getElementById('kirim').innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

    const REQ = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            nama: nama,
            hadir: hadir == 1,
            komentar: komentar
        })
    };

    await fetch('https://undangan-api-gules.vercel.app/api/comment', REQ)
        .then((res) => res.json())
        .then((res) => {
            if (res.code == 201) {
                document.getElementById('formnama').value = null;
                document.getElementById('hadiran').value = 0;
                document.getElementById('formpesan').value = null;
                ucapan();
            }

            if (res.error) {
                alert(Object.values(res.error)[0]);
            }
        })
        .catch((err) => alert(err));

    document.getElementById('kirim').disabled = false;
    document.getElementById('kirim').innerHTML = `Kirim<i class="fa-solid fa-paper-plane ms-1"></i>`;
};

document.addEventListener('DOMContentLoaded', () => {
    let modal = new bootstrap.Modal('#exampleModal');
    modal.show();
    timer();
});
