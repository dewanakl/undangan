import { storage } from './storage.mjs';
import { request, HTTP_GET, HTTP_PATCH, HTTP_PUT } from './request.mjs';

export const user = (() => {
    const token = storage('session');

    const getUserDetail = () => {
        request(HTTP_GET, '/api/user').token(token.get('token')).then((res) => {
            const user = storage('user');

            for (let [key, value] of Object.entries(res.data)) {
                user.set(key, value);
            }

            document.getElementById('dashboard-name').innerHTML = `${user.get('name')}<i class="fa-solid fa-hands text-warning ms-2"></i>`;
            document.getElementById('dashboard-email').innerHTML = user.get('email');
            document.getElementById('dashboard-accesskey').innerHTML = user.get('access_key');

            document.getElementById('filterBadWord').checked = Boolean(res.data.is_filter);
            document.getElementById('replyComment').checked = Boolean(res.data.can_reply);
            document.getElementById('editComment').checked = Boolean(res.data.can_edit);
            document.getElementById('deleteComment').checked = Boolean(res.data.can_delete);
        });
    };

    const getStatUser = () => {
        request(HTTP_GET, '/api/stats').token(token.get('token')).then((res) => {
            document.getElementById('count-comment').innerHTML = res.data.comments;
            document.getElementById('count-like').innerHTML = res.data.likes;
            document.getElementById('count-present').innerHTML = res.data.present;
            document.getElementById('count-absent').innerHTML = res.data.absent;
        });
    };

    const changeFilterBadWord = async (checkbox) => {
        checkbox.disabled = true;
        let labelCheckbox = document.querySelector(`label[for="${checkbox.id}"]`);
        let tmp = labelCheckbox.innerHTML;
        labelCheckbox.innerHTML = `<div class="spinner-border spinner-border-sm me-1 pb-0" role="status"></div>${tmp}`;

        await request(HTTP_PATCH, '/api/user').
            token(token.get('token')).
            body({
                filter: Boolean(checkbox.checked)
            }).
            then();

        labelCheckbox.innerHTML = tmp;
        checkbox.disabled = false;
    };

    const replyComment = async (checkbox) => {
        checkbox.disabled = true;
        let labelCheckbox = document.querySelector(`label[for="${checkbox.id}"]`);
        let tmp = labelCheckbox.innerHTML;
        labelCheckbox.innerHTML = `<div class="spinner-border spinner-border-sm me-1 pb-0" role="status"></div>${tmp}`;

        await request(HTTP_PATCH, '/api/user').
            token(token.get('token')).
            body({
                can_reply: Boolean(checkbox.checked)
            }).
            then();

        labelCheckbox.innerHTML = tmp;
        checkbox.disabled = false;
    };

    const editComment = async (checkbox) => {
        checkbox.disabled = true;
        let labelCheckbox = document.querySelector(`label[for="${checkbox.id}"]`);
        let tmp = labelCheckbox.innerHTML;
        labelCheckbox.innerHTML = `<div class="spinner-border spinner-border-sm me-1 pb-0" role="status"></div>${tmp}`;

        await request(HTTP_PATCH, '/api/user').
            token(token.get('token')).
            body({
                can_edit: Boolean(checkbox.checked)
            }).
            then();

        labelCheckbox.innerHTML = tmp;
        checkbox.disabled = false;
    };

    const deleteComment = async (checkbox) => {
        checkbox.disabled = true;
        let labelCheckbox = document.querySelector(`label[for="${checkbox.id}"]`);
        let tmp = labelCheckbox.innerHTML;
        labelCheckbox.innerHTML = `<div class="spinner-border spinner-border-sm me-1 pb-0" role="status"></div>${tmp}`;

        await request(HTTP_PATCH, '/api/user').
            token(token.get('token')).
            body({
                can_delete: Boolean(checkbox.checked)
            }).
            then();

        labelCheckbox.innerHTML = tmp;
        checkbox.disabled = false;
    };

    const regenerate = async (button) => {
        if (!confirm('Are you sure?')) {
            return;
        }

        button.disabled = true;
        let tmp = button.innerHTML;
        button.innerHTML = `<div class="spinner-border spinner-border-sm me-1" role="status"></div>${tmp}`;

        await request(HTTP_PUT, '/api/key').
            token(token.get('token')).
            then((res) => {
                if (res.data.status) {
                    getUserDetail();
                }
            });

        button.disabled = false;
        button.innerHTML = tmp;
    };

    const changePassword = async (button) => {
        const old = document.getElementById('old_password');
        const newest = document.getElementById('new_password');

        if (old.value.length == 0 || newest.value.length == 0) {
            alert('Password cannot be empty');
            return;
        }

        button.disabled = true;
        let tmp = button.innerHTML;
        button.innerHTML = `<div class="spinner-border spinner-border-sm me-1" role="status"></div>${tmp}`;

        old.disabled = true;
        newest.disabled = true;

        await request(HTTP_PATCH, '/api/user').
            token(token.get('token')).
            body({
                old_password: old.value,
                new_password: newest.value,
            }).
            then((res) => {
                if (res.data.status) {
                    old.value = null;
                    newest.value = null;
                    alert('Success Change Password');
                }
            });

        old.disabled = false;
        newest.disabled = false;

        button.disabled = false;
        button.innerHTML = tmp;
    };

    const download = async (button) => {
        button.disabled = true;
        let tmp = button.innerHTML;
        button.innerHTML = `<div class="spinner-border spinner-border-sm me-1" role="status"></div>${tmp}`;

        const res = await request(HTTP_GET, '/api/download').token(token.get('token')).download();
        const data = await res?.blob();

        const link = document.createElement('a');
        const href = window.URL.createObjectURL(data);

        link.href = href;
        link.download = res?.headers.get('content-disposition')?.match(/(?<=")(?:\\.|[^"\\])*(?=")/)[0];

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(href);

        button.disabled = false;
        button.innerHTML = tmp;
    };

    return {
        getUserDetail,
        getStatUser,
        changeFilterBadWord,
        replyComment,
        editComment,
        deleteComment,
        regenerate,
        changePassword,
        download
    };
})();