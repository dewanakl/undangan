import { util } from './util.js';
import { user } from './user.js';
import { theme } from './theme.js';
import { storage } from './storage.js';
import { comment } from './comment.js';
import { request, HTTP_POST } from './request.js';

export const session = (() => {

    const session = storage('session');

    theme.check();

    if (session.get('token')?.split('.').length !== 3 || JSON.parse(atob(session.get('token').split('.')[1])).exp < (new Date()).getTime() / 1000) {
        comment.renderLoading();
        (new bootstrap.Modal('#loginModal')).show();
    } else {
        user.getUserDetail();
        user.getStatUser();
        comment.comment();
    }

    const login = async (button) => {

        const btn = util.disableButton(button, '<div class="spinner-border spinner-border-sm me-1" role="status"></div>Loading..');
        const formEmail = document.getElementById('loginEmail');
        const formPassword = document.getElementById('loginPassword');

        formEmail.disabled = true;
        formPassword.disabled = true;

        const res = await request(HTTP_POST, '/api/session')
            .body({
                email: formEmail.value,
                password: formPassword.value
            })
            .then((res) => {
                if (res.code === 200) {
                    session.set('token', res.data.token);
                }

                return res.code === 200;
            });

        if (res) {
            bootstrap.Modal.getOrCreateInstance('#loginModal').hide();
            user.getUserDetail();
            user.getStatUser();
            comment.comment();
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

    return {
        login,
        logout
    };
})();