// OK
const audio = (() => {
    let instance = null;

    let createOrGet = () => {
        if (instance instanceof HTMLAudioElement) {
            return instance;
        }

        instance = new Audio();
        instance.autoplay = true;
        instance.src = document.getElementById('tombol-musik').getAttribute('data-url');
        instance.load();
        instance.currentTime = 0;
        instance.volume = 1;
        instance.muted = false;
        instance.loop = true;

        return instance;
    }

    return {
        play: () => {
            createOrGet().play();
        },
        pause: () => {
            createOrGet().pause();
        }
    };
})();

// OK
const progressBar = (() => {
    let bar = document.getElementById('bar');
    let second = 0;
    let counter = 0;
    let stop = false;

    const sleep = (until) => new Promise((p) => {
        setTimeout(p, until);
    });

    const setNum = (num) => {
        bar.style.width = num + "%";
        bar.innerText = num + "%";

        return num == 100 || stop;
    };

    (async () => {
        while (true) {
            if (stop || setNum(counter)) {
                break;
            }

            await sleep(Math.exp(second));
            second += 0.1;
            counter += 1;
        }
    })();

    return {
        stop: () => {
            stop = true;
            setNum(100.0);
        }
    };
})();

// OK
const pagination = (() => {

    const perPage = 10;
    let pageNow = 0;
    let resultData = 0;
    let page = document.getElementById('page');
    let prev = document.getElementById('previous');
    let next = document.getElementById('next');

    let disabledPrevious = () => {
        prev.classList.add('disabled');
    };

    let disabledNext = () => {
        next.classList.add('disabled');
    };

    let buttonAction = async (button) => {
        let tmp = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;
        await comment.ucapan();
        document.getElementById('daftarucapan').scrollIntoView({ behavior: 'smooth' });
        button.disabled = false;
        button.innerHTML = tmp;
    };

    return {
        getPer: () => {
            return perPage;
        },
        getNext: () => {
            return pageNow;
        },
        reset: async () => {
            pageNow = 0;
            resultData = 0;
            await comment.ucapan();
            page.innerText = 1;
            next.classList.remove('disabled');
            disabledPrevious();
        },
        setResultData: (len) => {
            resultData = len;
            if (resultData < perPage) {
                disabledNext();
            }
        },
        previous: async (button) => {
            if (pageNow < 0) {
                disabledPrevious();
            } else {
                pageNow -= perPage;
                disabledNext();
                await buttonAction(button);
                page.innerText = parseInt(page.innerText) - 1;
                next.classList.remove('disabled');
                if (pageNow <= 0) {
                    disabledPrevious();
                }
            }
        },
        next: async (button) => {
            if (resultData < perPage) {
                disabledNext();
            } else {
                pageNow += perPage;
                disabledPrevious();
                await buttonAction(button);
                page.innerText = parseInt(page.innerText) + 1;
                prev.classList.remove('disabled');
            }
        }
    };
})();

// 
const comment = (() => {
    const kirim = document.getElementById('kirim');
    const hadiran = document.getElementById('hadiran');
    const kirimBalasan = document.getElementById('kirimbalasan');
    const formnama = document.getElementById('formnama');
    const formpesan = document.getElementById('formpesan');

    const resetForm = () => {
        kirim.style.display = 'block';
        hadiran.style.display = 'block';
        document.getElementById('labelhadir').style.display = 'block';
        document.getElementById('batal').style.display = 'none';
        kirimBalasan.style.display = 'none';
        document.getElementById('idbalasan').value = null;
        document.getElementById('balasan').innerHTML = null;
        formnama.value = null;
        hadiran.value = 0;
        formpesan.value = null;
    };

    // OK
    const send = async () => {
        let nama = formnama.value;
        let hadir = hadiran.value;
        let komentar = formpesan.value;
        let token = localStorage.getItem('token') ?? '';

        if (token.length == 0) {
            alert('Terdapat kesalahan, token kosong !');
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

        formnama.disabled = true;
        hadiran.disabled = true;
        formpesan.disabled = true;
        kirim.disabled = true;

        let tmp = kirim.innerHTML;
        kirim.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

        await fetch(
            getUrl('/api/comment'),
            parseRequest('POST', token, {
                nama: nama,
                hadir: hadir == 1,
                komentar: komentar
            }))
            .then((res) => res.json())
            .then((res) => {
                if (res.code == 201) {
                    owns.set(res.data.uuid, res.data.own);
                    resetForm();
                    pagination.reset();
                }

                if (res.error.length != 0) {
                    if (res.error[0] == 'Expired token') {
                        alert('Terdapat kesalahan, token expired !');
                        window.location.reload();
                        return;
                    }

                    throw res.error[0];
                }
            })
            .catch((err) => {
                resetForm();
                alert(err);
            });

        formnama.disabled = false;
        hadiran.disabled = false;
        formpesan.disabled = false;
        kirim.disabled = false;
        kirim.innerHTML = tmp;
    };

    const balasan = async (button) => {
        button.disabled = true;
        let tmp = button.innerText;
        button.innerText = 'Loading...';

        let id = button.getAttribute('data-uuid');
        let token = localStorage.getItem('token') ?? '';

        if (token.length == 0) {
            alert('Terdapat kesalahan, token kosong !');
            window.location.reload();
            return;
        }

        const BALAS = document.getElementById('balasan');
        BALAS.innerHTML = renderLoading(1);
        hadiran.style.display = 'none';
        document.getElementById('labelhadir').style.display = 'none';

        await fetch(getUrl('/api/comment/' + id), parseRequest('GET', token))
            .then((res) => res.json())
            .then((res) => {
                if (res.code == 200) {
                    kirim.style.display = 'none';
                    document.getElementById('batal').style.display = 'block';
                    kirimBalasan.style.display = 'block';
                    document.getElementById('idbalasan').value = id;

                    BALAS.innerHTML = `
                <div class="card-body bg-light shadow p-3 my-2 rounded-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-center">
                        <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                            <strong>${escapeHtml(res.data.nama)}</strong>
                        </p>
                        <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${res.data.created_at}</small>
                    </div>
                    <hr class="text-dark my-1">
                    <p class="text-dark m-0 p-0" style="white-space: pre-line">${escapeHtml(res.data.komentar)}</p>
                </div>`;
                }

                if (res.error.length != 0) {
                    if (res.error[0] == 'Expired token') {
                        alert('Terdapat kesalahan, token expired !');
                        window.location.reload();
                        return;
                    }

                    throw res.error[0];
                }
            })
            .catch((err) => {
                resetForm();
                alert(err);
            });

        document.getElementById('ucapan').scrollIntoView({ behavior: 'smooth' });
        button.disabled = false;
        button.innerText = tmp;
    };

    const innerCard = (comment) => {
        let result = '';

        comment.forEach((data) => {
            result += `
            <div class="card-body border-start bg-light py-2 ps-2 pe-0 my-2 ms-2 me-0" id="${data.uuid}">
                <div class="d-flex flex-wrap justify-content-between align-items-center">
                    <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                        <strong>${escapeHtml(data.nama)}</strong>
                    </p>
                    <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${data.created_at}</small>
                </div>
                <hr class="text-dark my-1">
                <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${escapeHtml(data.komentar)}</p>
                <div class="d-flex flex-wrap justify-content-between align-items-center">
                    <div class="d-flex flex-wrap justify-content-start align-items-center">
                        <button style="font-size: 0.8rem;" onclick="comment.balasan(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0">Balas</button>
                        ${owns.has(data.uuid)
                    ? `
                        <button style="font-size: 0.8rem;" onclick="comment.edit(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0 ms-1">Ubah</button>
                        <button style="font-size: 0.8rem;" onclick="comment.hapus(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0 ms-1">Hapus</button>`
                    : ''}
                    </div>
                    <button style="font-size: 0.8rem;" onclick="like(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-2 py-0 px-0">
                        <div class="d-flex justify-content-start align-items-center">
                            <p class="my-0 mx-1" data-suka="${data.like.love}">${data.like.love} suka</p>
                            <i class="py-1 me-1 p-0 ${likes.has(data.uuid) ? 'fa-solid fa-heart text-danger' : 'fa-regular fa-heart'}"></i>
                        </div>
                    </button>
                </div>
                ${innerCard(data.comments)}
            </div>`;
        });

        return result;
    };

    const renderCard = (data) => {
        const DIV = document.createElement('div');
        DIV.classList.add('mb-3');
        DIV.innerHTML = `
        <div class="card-body bg-light shadow p-3 m-0 rounded-4" id="${data.uuid}">
            <div class="d-flex flex-wrap justify-content-between align-items-center">
                <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                    <strong class="me-1">${escapeHtml(data.nama)}</strong><i class="fa-solid ${data.hadir ? 'fa-circle-check text-success' : 'fa-circle-xmark text-danger'}"></i>
                </p>
                <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${data.created_at}</small>
            </div>
            <hr class="text-dark my-1">
            <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${escapeHtml(data.komentar)}</p>
            <div class="d-flex flex-wrap justify-content-between align-items-center">
                <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <button style="font-size: 0.8rem;" onclick="comment.balasan(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0">Balas</button>
                    ${owns.has(data.uuid)
                ? `
                    <button style="font-size: 0.8rem;" onclick="comment.edit(this)" data-parent="true" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0 ms-1">Ubah</button>
                    <button style="font-size: 0.8rem;" onclick="comment.hapus(this)" data-parent="true" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0 ms-1">Hapus</button>`
                : ''}
                </div>
                <button style="font-size: 0.8rem;" onclick="like(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-2 py-0 px-0">
                    <div class="d-flex justify-content-start align-items-center">
                        <p class="my-0 mx-1" data-suka="${data.like.love}">${data.like.love} suka</p>
                        <i class="py-1 me-1 p-0 ${likes.has(data.uuid) ? 'fa-solid fa-heart text-danger' : 'fa-regular fa-heart'}"></i>
                    </div>
                </button>
            </div>
            ${innerCard(data.comments)}
        </div>`;
        return DIV;
    };

    // OK
    const ucapan = async () => {
        const UCAPAN = document.getElementById('daftarucapan');
        UCAPAN.innerHTML = renderLoading(pagination.getPer());
        let token = localStorage.getItem('token') ?? '';

        if (token.length == 0) {
            alert('Terdapat kesalahan, token kosong !');
            window.location.reload();
            return;
        }

        await fetch(getUrl(`/api/comment?per=${pagination.getPer()}&next=${pagination.getNext()}`),
            parseRequest('GET', token)
        )
            .then((res) => res.json())
            .then((res) => {
                if (res.code == 200) {
                    UCAPAN.innerHTML = null;
                    res.data.forEach((data) => UCAPAN.appendChild(renderCard(data)));
                    pagination.setResultData(res.data.length);

                    if (res.data.length == 0) {
                        UCAPAN.innerHTML = `<div class="h6 text-center">Tidak ada data</div>`;
                    }
                }

                if (res.error.length != 0) {
                    if (res.error[0] == 'Expired token') {
                        alert('Terdapat kesalahan, token expired !');
                        window.location.reload();
                        return;
                    }

                    throw res.error[0];
                }
            })
            .catch((err) => alert(err));
    };

    // OK
    const renderLoading = (num) => {
        let result = '';

        for (let index = 0; index < num; index++) {
            result += `
            <div class="mb-3">
                <div class="card-body bg-light shadow p-3 m-0 rounded-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-center placeholder-glow">
                        <span class="placeholder bg-secondary col-5"></span>
                        <span class="placeholder bg-secondary col-3"></span>
                    </div>
                    <hr class="text-dark my-1">
                    <p class="card-text placeholder-glow">
                        <span class="placeholder bg-secondary col-6"></span>
                        <span class="placeholder bg-secondary col-5"></span>
                        <span class="placeholder bg-secondary col-12"></span>
                    </p>
                </div>
            </div>`;
        }

        return result;
    };


    const sendReply = async () => {
        let nama = formnama.value;
        let komentar = formpesan.value;
        let token = localStorage.getItem('token') ?? '';
        let id = document.getElementById('idbalasan').value;

        if (token.length == 0) {
            alert('Terdapat kesalahan, token kosong !');
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

        if (komentar.length == 0) {
            alert('pesan tidak boleh kosong');
            return;
        }

        formnama.disabled = true;
        formpesan.disabled = true;

        document.getElementById('batal').disabled = true;
        kirimBalasan.disabled = true;
        let tmp = kirimBalasan.innerHTML;
        kirimBalasan.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

        let isSuccess = false;
        await fetch(
            getUrl('/api/comment'),
            parseRequest('POST', token, {
                nama: nama,
                id: id,
                komentar: komentar
            }))
            .then((res) => res.json())
            .then((res) => {
                if (res.code == 201) {
                    isSuccess = true;
                    setTempOwn(res.data.uuid, res.data.own);
                }

                if (res.error.length != 0) {
                    if (res.error[0] == 'Expired token') {
                        alert('Terdapat kesalahan, token expired !');
                        window.location.reload();
                        return;
                    }

                    throw res.error[0];
                }
            })
            .catch((err) => {
                resetForm();
                alert(err);
            });

        if (isSuccess) {
            await ucapan();
            document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
            resetForm();
        }

        document.getElementById('batal').disabled = false;
        kirimBalasan.disabled = false;
        kirimBalasan.innerHTML = tmp;
        formnama.disabled = false;
        formpesan.disabled = false;
    };


    const ubah = async (button) => {
        let token = localStorage.getItem('token') ?? '';
        let id = document.getElementById('idModalEdit').value;

        if (token.length == 0) {
            alert('Terdapat kesalahan, token kosong !');
            window.location.reload();
            return;
        }

        button.disabled = true;
        let tmp = button.innerText;
        button.innerText = 'Loading..';

        let isSuccess = false;
        await fetch(
            getUrl('/api/comment/' + getTempOwn(id)),
            parseRequest('PUT', token, {
                hadir: document.getElementById('edithadiran').value == 1,
                komentar: document.getElementById('editformpesan').value
            }))
            .then((res) => res.json())
            .then((res) => {
                if (res.error.length != 0) {
                    if (res.error[0] == 'Expired token') {
                        alert('Terdapat kesalahan, token expired !');
                        window.location.reload();
                        return;
                    }

                    throw res.error[0];
                }

                if (res.data.status) {
                    bootstrap.Modal.getInstance(document.getElementById('modalEdit')).hide();
                    isSuccess = true;
                }
            })
            .catch((err) => {
                alert(err);
            });


        button.innerText = tmp;
        button.disabled = false;

        if (isSuccess) {
            ucapan();
        }
    };

    const hapus = async (button) => {
        if (!confirm('Kamu yakin ingin menghapus?')) {
            return;
        }

        let token = localStorage.getItem('token') ?? '';
        let id = button.getAttribute('data-uuid');

        if (token.length == 0) {
            alert('Terdapat kesalahan, token kosong !');
            window.location.reload();
            return;
        }

        button.disabled = true;
        let tmp = button.innerText;
        button.innerText = 'Loading..';

        let isSuccess = false;
        await fetch(
            getUrl('/api/comment/' + owns.get(id)),
            parseRequest('DELETE', token))
            .then((res) => res.json())
            .then((res) => {
                if (res.error.length != 0) {
                    if (res.error[0] == 'Expired token') {
                        alert('Terdapat kesalahan, token expired !');
                        window.location.reload();
                        return;
                    }

                    throw res.error[0];
                }

                if (res.data.status) {
                    owns.unset(id);
                    isSuccess = true;
                }
            })
            .catch((err) => {
                alert(err);
            });

        button.innerText = tmp;
        button.disabled = false;

        if (isSuccess) {
            ucapan();
        }
    };

    const modalEdit = async (button) => {
        button.disabled = true;
        let tmp = button.innerText;
        button.innerText = 'Loading...';

        let id = button.getAttribute('data-uuid').toString();
        let token = localStorage.getItem('token') ?? '';

        if (token.length == 0) {
            alert('Terdapat kesalahan, token kosong !');
            window.location.reload();
            return;
        }

        let ress = {};

        await fetch(getUrl('/api/comment/' + id), parseRequest('GET', token))
            .then((res) => res.json())
            .then((res) => {
                if (res.code == 200) {
                    ress = res.data;
                }

                if (res.error.length != 0) {
                    if (res.error[0] == 'Expired token') {
                        alert('Terdapat kesalahan, token expired !');
                        window.location.reload();
                        return;
                    }

                    throw res.error[0];
                }
            })
            .catch((err) => {
                resetForm();
                alert(err);
            });

        button.disabled = false;
        button.innerText = tmp;

        let modal = new bootstrap.Modal('#modalEdit');
        document.getElementById('idModalEdit').value = button.getAttribute('data-uuid');

        if (button.getAttribute('data-parent') !== 'true') {
            document.getElementById('edithadiran').style.display = 'none';
            document.getElementById('editlabelhadir').style.display = 'none';
        } else {
            let mySelect = document.getElementById('edithadiran');
            // for (let i, j = 0; i = mySelect.options[j]; j++) {

            //     i.selected = i.value == (ress.hadir ? 1 : 2);

            // }

            // for (var i = 0; i < mySelect.options.length; i++) {
            //     console.log(mySelect.options[i].defaultSelected);
            //     mySelect.options[i].defaultSelected = i == (ress.hadir ? "0" : "1");
            // }


            mySelect.value = ress.hadir;

            document.getElementById('edithadiran').style.display = 'block';
            document.getElementById('editlabelhadir').style.display = 'block';
        }

        document.getElementById('editformpesan').innerText = ress.komentar

        modal.show();
    };

    return {
        kirim: () => send(),
        ucapan: () => ucapan(),
        hapus: (btn) => hapus(btn),
        edit: () => modalEdit(),
        renderLoading: (num) => renderLoading(num),
        balasan: (btn) => balasan(btn)
    };
})();

// OK
const storage = (table) => ((table) => {

    const get = (key = null) => {
        if (!localStorage.getItem(table)) {
            localStorage.setItem(table, JSON.stringify({}));
        }

        if (key) {
            return JSON.parse(localStorage.getItem(table))[key];
        }

        return JSON.parse(localStorage.getItem(table));
    };

    const set = (key, value) => {
        let storage = get();
        storage[key] = value;
        localStorage.setItem(table, JSON.stringify(storage));
    };

    const unset = (key) => {
        let storage = get();
        delete storage[key];
        localStorage.setItem(table, JSON.stringify(storage));
    };

    const has = (key) => {
        return Object.keys(get()).includes(key);
    };

    return {
        get: (key = null) => get(key),
        set: (key, value) => set(key, value),
        unset: (key) => unset(key),
        has: (key) => has(key),
    };
})(table);

// OK
const likes = storage('likes');

// OK
const owns = storage('owns');

// OK
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// OK
const salin = (btn, msg = null, timeout = 1500) => {
    navigator.clipboard.writeText(btn.getAttribute('data-nomer'));
    let tmp = btn.innerHTML;
    btn.innerHTML = msg ?? 'Tersalin';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = tmp;
        btn.disabled = false;
        btn.focus();
    }, timeout);
};

// OK
const timer = () => {
    let countDownDate = (new Date(document.getElementById('tampilan-waktu').getAttribute('data-waktu').replace(' ', 'T'))).getTime();
    let time = null;

    time = setInterval(() => {
        let distance = countDownDate - (new Date()).getTime();

        if (distance < 0) {
            clearInterval(time);
            time = null;
            return;
        }

        document.getElementById('hari').innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
        document.getElementById('jam').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('menit').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('detik').innerText = Math.floor((distance % (1000 * 60)) / 1000);
    }, 1000);
};

// OK
const animation = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    let skew = 1;

    let randomInRange = (min, max) => {
        return Math.random() * (max - min) + min;
    }

    (function frame() {
        const timeLeft = animationEnd - Date.now();
        skew = Math.max(0.9, skew - 0.001);

        confetti({
            particleCount: 2,
            startVelocity: 0,
            ticks: Math.max(250, 500 * (timeLeft / duration)),
            origin: {
                x: Math.random(),
                y: Math.random() * skew - 0.1,
            },
            colors: ["FFC0CB", "FF69B4", "FF1493", "C71585"],
            shapes: ["heart"],
            gravity: randomInRange(0, 0.5),
            scalar: randomInRange(1, 2),
            drift: randomInRange(-0.5, 0.5),
        });

        if (timeLeft > 0) {
            requestAnimationFrame(frame);
        }
    })();
};

// OK
const buka = async () => {
    opacity('welcome')
    document.getElementById('tombol-musik').style.display = 'block';
    audio.play();
    AOS.init();
    await login();
    timer();
    animation();
};

// OK
const play = (btn) => {
    if (btn.getAttribute('data-status') !== 'true') {
        btn.setAttribute('data-status', 'true');
        audio.play();
        btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
    } else {
        btn.setAttribute('data-status', 'false');
        audio.pause();
        btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    }
};

// OK
const parseRequest = (method, token = null, body = null) => {
    let req = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        req.headers['Authorization'] = 'Bearer ' + token;
    }

    if (body) {
        req.body = JSON.stringify(body);
    }

    return req;
};

// OK
const getUrl = (path = null) => {
    let url = document.querySelector('body').getAttribute('data-url');

    if (url.slice(-1) == '/') {
        url = url.slice(0, -1);
    }

    if (path) {
        return url + path;
    }

    return url;
};

// OK
const modalFoto = (img) => {
    let modal = new bootstrap.Modal('#modalFoto');
    document.getElementById('showModalFoto').src = img.src;
    modal.show();
};

// OK
const namaTamu = () => {
    let name = (new URLSearchParams(window.location.search)).get('to') ?? '';

    if (name.length == 0) {
        document.getElementById('nama-tamu').remove();
        return;
    }

    let div = document.createElement('div');
    div.classList.add('m-2');
    div.innerHTML = `<p class="mt-0 mb-1 mx-0 p-0 text-light">Kepada Yth Bapak/Ibu/Saudara/i</p><h2 class="text-light">${escapeHtml(name)}</h2>`;

    formnama.value = escapeHtml(name);
    document.getElementById('nama-tamu').appendChild(div);
};

// OK
const login = async () => {
    document.getElementById('daftarucapan').innerHTML = comment.renderLoading(pagination.getPer());
    let body = document.querySelector('body');

    await fetch(
        getUrl('/api/session'),
        parseRequest('POST', null, {
            email: body.getAttribute('data-email'),
            password: body.getAttribute('data-password')
        }))
        .then((res) => res.json())
        .then((res) => {
            if (res.code == 200) {
                localStorage.removeItem('token');
                localStorage.setItem('token', res.data.token);
                comment.ucapan();
            }

            if (res.error.length != 0) {
                alert('Terdapat kesalahan, ' + res.error[0]);
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

// OK
const like = async (button) => {
    let token = localStorage.getItem('token') ?? '';
    let id = button.getAttribute('data-uuid');

    if (token.length == 0) {
        alert('Terdapat kesalahan, token kosong !');
        window.location.reload();
        return;
    }

    let heart = button.firstElementChild.lastElementChild;
    let info = button.firstElementChild.firstElementChild;

    button.disabled = true;
    info.innerText = 'Loading..';

    if (likes.has(id)) {
        await fetch(
            getUrl('/api/comment/' + likes.get(id)),
            parseRequest('PATCH', token))
            .then((res) => res.json())
            .then((res) => {
                if (res.error.length != 0) {
                    if (res.error[0] == 'Expired token') {
                        alert('Terdapat kesalahan, token expired !');
                        window.location.reload();
                        return;
                    }

                    throw res.error[0];
                }

                if (res.data.status) {
                    likes.unset(id);

                    heart.classList.remove('fa-solid', 'text-danger');
                    heart.classList.add('fa-regular');

                    info.setAttribute('data-suka', (parseInt(info.getAttribute('data-suka')) - 1).toString())
                    info.innerText = info.getAttribute('data-suka') + ' suka';
                }
            })
            .catch((err) => {
                alert(err);
            });

    } else {
        await fetch(
            getUrl('/api/comment/' + id),
            parseRequest('POST', token))
            .then((res) => res.json())
            .then((res) => {
                if (res.error.length != 0) {
                    if (res.error[0] == 'Expired token') {
                        alert('Terdapat kesalahan, token expired !');
                        window.location.reload();
                        return;
                    }

                    throw res.error[0];
                }

                if (res.code == 201) {
                    likes.set(id, res.data.uuid);

                    heart.classList.remove('fa-regular');
                    heart.classList.add('fa-solid', 'text-danger');

                    info.setAttribute('data-suka', (parseInt(info.getAttribute('data-suka')) + 1).toString())
                    info.innerText = info.getAttribute('data-suka') + ' suka';
                }
            })
            .catch((err) => {
                alert(err);
            });
    }

    button.disabled = false;
};

// OK
const opacity = (nama) => {
    progressBar.stop();

    let op = parseInt(document.getElementById(nama).style.opacity);
    let clear = null;

    clear = setInterval(() => {
        if (op >= 0) {
            op -= 0.025;
            document.getElementById(nama).style.opacity = op;
        } else {
            clearInterval(clear);
            clear = null;
            document.getElementById(nama).remove();
        }
    }, 10);
};

// OK
window.addEventListener('load', () => {
    namaTamu();
    opacity('loading');

    function fire(particleRatio, opts) {
        confetti(
            Object.assign({}, opts, {
                particleCount: Math.floor(250 * particleRatio),
                zIndex: 1057,
                origin: { y: 0.7 }
            })
        );
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });

    fire(0.2, {
        spread: 60,
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });

}, false);
