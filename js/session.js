import { dto } from './dto.js';
import { util } from './util.js';
import { admin } from './admin.js';
import { storage } from './storage.js';
import { comment } from './comment.js';
import { progress } from './progress.js';
import { bootstrap } from './bootstrap.js';
import { request, HTTP_POST, HTTP_GET } from './request.js';

export const session = (() => {

    const session = storage('session');

    const getToken = () => session.get('token');

    const login = async (button) => {

        const btn = util.disableButton(button);
        const formEmail = document.getElementById('loginEmail');
        const formPassword = document.getElementById('loginPassword');

        formEmail.disabled = true;
        formPassword.disabled = true;

        const res = await request(HTTP_POST, '/api/session')
            .body(dto.postSessionRequest(formEmail.value, formPassword.value))
            .send(dto.tokenResponse)
            .then((res) => {
                if (res.code === 200) {
                    session.set('token', res.data.token);
                }

                return res;
            })
            .then((res) => res.code === 200, () => false);

        if (res) {
            bootstrap.Modal.getOrCreateInstance('#loginModal').hide();
            admin.getUserDetail();
            admin.getStatUser();
            comment.comment();
            formEmail.value = null;
            formPassword.value = null;
        }

        btn.restore();
        formEmail.disabled = false;
        formPassword.disabled = false;
    };

    const logout = () => {
        if (!confirm('Are you sure?')) {
            return;
        }

        session.unset('token');
        (new bootstrap.Modal('#loginModal')).show();
    };

    const isAdmin = () => {
        return (getToken() ?? '.').split('.').length === 3;
    };

    const guest = () => {
        progress.add();
        request(HTTP_GET, '/api/config')
            .token(document.body.getAttribute('data-key'))
            .send()
            .then(async (res) => {
                session.set('token', document.body.getAttribute('data-key'));

                const config = storage('config');
                for (let [key, value] of Object.entries(res.data)) {
                    config.set(key, value);
                }

                await comment.comment();

                progress.complete('request');
            }).catch(() => {
                progress.invalid('request')
            });
    };

    return {
        guest,
        login,
        logout,
        isAdmin,
        getToken,
    };
})();