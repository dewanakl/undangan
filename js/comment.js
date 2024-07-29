import { card } from './card.js';
import { util } from './util.js';
import { like } from './like.js';
import { theme } from './theme.js';
import { storage } from './storage.js';
import { pagination } from './pagination.js';
import { request, HTTP_GET, HTTP_POST, HTTP_DELETE, HTTP_PUT } from './request.js';

export const comment = (() => {

    const owns = storage('owns');
    const session = storage('session');
    const showHide = storage('comment');

    if (!showHide.has('hidden')) {
        showHide.set('hidden', []);
    }

    if (!showHide.has('show')) {
        showHide.set('show', []);
    }

    const remove = async (button) => {
        if (!confirm('Are you sure?')) {
            return;
        }

        const id = button.getAttribute('data-uuid');

        if (session.get('token')?.split('.').length === 3) {
            owns.set(id, button.getAttribute('data-own'));
        }

        const btn = util.disableButton(button);

        await request(HTTP_DELETE, '/api/comment/' + owns.get(id))
            .token(session.get('token'))
            .then((res) => {
                if (res.data.status) {
                    owns.unset(id);
                    document.getElementById(id).remove();
                }
            });

        btn.restore();
    };

    const changeButton = (id, disabled) => {
        const buttonMethod = ['reply', 'edit', 'remove'];

        buttonMethod.forEach((v) => {
            const status = document.querySelector(`[onclick="comment.${v}(this)"][data-uuid="${id}"]`);
            if (status) {
                status.disabled = disabled;
            }
        });
    };

    const update = async (button) => {
        const id = button.getAttribute('data-uuid');

        const presence = document.getElementById(`form-inner-presence-${id}`);
        if (presence) {
            presence.disabled = true;
        }

        const form = document.getElementById(`form-${id ? `inner-${id}` : 'comment'}`);
        form.disabled = true;

        const cancel = document.querySelector(`[onclick="comment.cancel('${id}')"]`);
        if (cancel) {
            cancel.disabled = true;
        }

        const btn = util.disableButton(button);

        const status = await request(HTTP_PUT, '/api/comment/' + owns.get(id))
            .token(session.get('token'))
            .body({
                presence: presence ? presence.value === "1" : null,
                comment: form.value
            })
            .then((res) => res.data.status);

        form.disabled = false;
        if (cancel) {
            cancel.disabled = false;
        }

        if (presence) {
            presence.disabled = false;
        }

        btn.restore();

        if (status) {
            comment();
        }
    };

    const send = async (button) => {
        const id = button.getAttribute('data-uuid');

        const name = document.getElementById('form-name');
        if (name.value.length == 0) {
            alert('Please fill name');
            return;
        }

        const presence = document.getElementById('form-presence');
        if (!id && presence && presence.value == "0") {
            alert('Please select presence');
            return;
        }

        if (presence) {
            presence.disabled = true;
        }

        const form = document.getElementById(`form-${id ? `inner-${id}` : 'comment'}`);
        form.disabled = true;

        const cancel = document.querySelector(`[onclick="comment.cancel('${id}')"]`);
        if (cancel) {
            cancel.disabled = true;
        }

        const btn = util.disableButton(button);

        const response = await request(HTTP_POST, '/api/comment')
            .token(session.get('token'))
            .body({
                id: id,
                name: name.value,
                presence: presence ? presence.value === "1" : true,
                comment: form.value
            })
            .then();

        form.disabled = false;
        if (cancel) {
            cancel.disabled = false;
        }

        if (presence) {
            presence.disabled = false;
        }

        btn.restore();

        if (response?.code === 201) {
            owns.set(response.data.uuid, response.data.own);
            form.value = null;
            if (presence) {
                presence.value = "0";
            }

            if (!id) {
                await pagination.reset();
                document.getElementById('comments').scrollIntoView({ behavior: 'smooth' });
            }

            if (id) {
                await comment();
            }
        }
    };

    const cancel = (id) => {
        if (document.getElementById(`form-inner-${id}`).value.length === 0 || confirm('Are you sure?')) {
            changeButton(id, false);
            document.getElementById(`inner-${id}`).remove();
        }
    };

    const reply = (button) => {
        const id = button.getAttribute('data-uuid');

        if (document.getElementById(`inner-${id}`)) {
            return;
        }

        changeButton(id, true);

        const inner = document.createElement('div');
        inner.classList.add('my-2');
        inner.id = `inner-${id}`;
        inner.innerHTML = `
        <label for="form-inner-${id}" class="form-label">Reply</label>
        <textarea class="form-control shadow-sm rounded-4 mb-2" id="form-inner-${id}" placeholder="Type reply comment"></textarea>
        <div class="d-flex flex-wrap justify-content-end align-items-center mb-0">
            <button style="font-size: 0.8rem;" onclick="comment.cancel('${id}')" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-4 py-0 me-1">Cancel</button>
            <button style="font-size: 0.8rem;" onclick="comment.send(this)" data-uuid="${id}" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-4 py-0">Send</button>
        </div>`;

        document.getElementById(`button-${id}`).insertAdjacentElement('afterend', inner);
    };

    const edit = async (button) => {
        const id = button.getAttribute('data-uuid');

        if (document.getElementById(`inner-${id}`)) {
            return;
        }

        changeButton(id, true);
        const tmp = button.innerText;
        button.innerText = 'Loading..';

        const status = await request(HTTP_GET, '/api/comment/' + id)
            .token(session.get('token'))
            .then((res) => res);

        if (status?.code === 200) {
            const inner = document.createElement('div');
            inner.classList.add('my-2');
            inner.id = `inner-${id}`;
            inner.innerHTML = `
            <label for="form-inner-${id}" class="form-label">Edit</label>
            ${document.getElementById(id).getAttribute('data-parent') === 'true' ? `
            <select class="form-select shadow-sm mb-2 rounded-4" id="form-inner-presence-${id}">
                <option value="1" ${status.data.presence ? 'selected' : ''}>Datang</option>
                <option value="2" ${status.data.presence ? '' : 'selected'}>Berhalangan</option>
            </select>` : ''}
            <textarea class="form-control shadow-sm rounded-4 mb-2" id="form-inner-${id}" placeholder="Type update comment"></textarea>
            <div class="d-flex flex-wrap justify-content-end align-items-center mb-0">
                <button style="font-size: 0.8rem;" onclick="comment.cancel('${id}')" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-4 py-0 me-1">Cancel</button>
                <button style="font-size: 0.8rem;" onclick="comment.update(this)" data-uuid="${id}" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-4 py-0">Update</button>
            </div>`;

            document.getElementById(`button-${id}`).insertAdjacentElement('afterend', inner);
            document.getElementById(`form-inner-${id}`).value = status.data.comment;
        }

        button.innerText = tmp;
    };

    const comment = async () => {
        card.renderLoading();

        await request(HTTP_GET, `/api/comment?per=${pagination.getPer()}&next=${pagination.getNext()}`)
            .token(session.get('token'))
            .then((res) => {
                if (res.code !== 200) {
                    return;
                }

                const comments = document.getElementById('comments');
                pagination.setResultData(res.data.length);

                if (res.data.length === 0) {
                    comments.innerHTML = `<div class="h6 text-center fw-bold p-4 my-3 bg-theme-${theme.isDarkMode('dark', 'light')} rounded-4 shadow">Yuk bagikan undangan ini biar banyak komentarnya</div>`;
                    return;
                }

                const uuids = util.extractUUIDs(res.data);
                showHide.set('hidden', (() => {
                    let arrHidden = showHide.get('hidden');
                    uuids.forEach((c) => {
                        if (!arrHidden.find((item) => item.uuid === c)) {
                            arrHidden.push({
                                uuid: c,
                                show: false,
                            });
                        }
                    });

                    return arrHidden;
                })());

                comments.innerHTML = res.data.map((comment) => card.renderContent(comment)).join('');

                uuids.forEach((c) => {
                    like.setTapTap(c);
                });
                res.data.forEach((c) => {
                    card.fetchTracker(c);
                });
            });
    };

    const showOrHide = (button) => {
        const ids = button.getAttribute('data-uuids').split(',');
        const show = button.getAttribute('data-show') === 'true';
        const uuid = button.getAttribute('data-uuid');

        if (show) {
            button.setAttribute('data-show', 'false');
            button.innerText = 'Show replies' + ' (' + ids.length + ')';

            showHide.set('show', showHide.get('show').filter((item) => item !== uuid));
        } else {
            button.setAttribute('data-show', 'true');
            button.innerText = 'Hide replies';

            showHide.set('show', [...showHide.get('show'), uuid]);
        }

        for (const id of ids) {
            showHide.set('hidden', showHide.get('hidden').map((item) => {
                if (item.uuid === id) {
                    return { uuid: id, show: !show };
                }

                return item;
            }));

            if (!show) {
                document.getElementById(id).classList.remove('d-none');
            } else {
                document.getElementById(id).classList.add('d-none');
            }
        }
    };

    return {
        cancel,
        send,
        edit,
        reply,
        remove,
        update,
        comment,
        showOrHide,
        renderLoading: card.renderLoading,
    }
})();