import { dto } from './dto.js';
import { card } from './card.js';
import { util } from './util.js';
import { theme } from './theme.js';
import { storage } from './storage.js';
import { pagination } from './pagination.js';
import { request, HTTP_GET, HTTP_POST, HTTP_DELETE, HTTP_PUT } from './request.js';

export const comment = (() => {

    const owns = storage('owns');
    const user = storage('user');
    const session = storage('session');
    const showHide = storage('comment');

    const remove = async (button) => {
        if (!confirm('Are you sure?')) {
            return;
        }

        const id = button.getAttribute('data-uuid');

        if (session.get('token')?.split('.').length === 3) {
            owns.set(id, button.getAttribute('data-own'));
        }

        const btn = util.disableButton(button);

        const status = await request(HTTP_DELETE, '/api/comment/' + owns.get(id))
            .token(session.get('token'))
            .send()
            .then((res) => res.data.status, () => false);

        if (!status) {
            btn.restore();
            return;
        }

        owns.unset(id);
        document.getElementById(id).remove();

        document.querySelectorAll('a[onclick="comment.showOrHide(this)"]').forEach((n) => {
            const oldUuids = n.getAttribute('data-uuids').split(',');

            if (oldUuids.find((i) => i === id)) {
                const uuids = oldUuids.filter((i) => i !== id).join(',');
                
                if (uuids.length === 0) {
                    n.remove();
                } else {
                    n.setAttribute('data-uuids', uuids);
                }
            }
        });
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
            .send()
            .then((res) => res.data.status, () => false);

        form.disabled = false;
        if (cancel) {
            cancel.disabled = false;
        }

        if (presence) {
            presence.disabled = false;
        }

        btn.restore();

        if (status) {
            changeButton(id, false);
            document.getElementById(`inner-${id}`).remove();
            document.getElementById(`content-${id}`).innerHTML = card.convertMarkdownToHTML(util.escapeHtml(form.value));

            const badge = document.getElementById(`badge-${id}`);
            if (!presence || !badge) {
                return;
            }

            if (presence.value === "1") {
                badge.classList.remove('fa-circle-xmark', 'text-danger');
                badge.classList.add('fa-circle-check', 'text-success');
                return;
            }

            badge.classList.remove('fa-circle-check', 'text-success');
            badge.classList.add('fa-circle-xmark', 'text-danger');
        }
    };

    const send = async (button) => {
        const id = button.getAttribute('data-uuid');

        const name = document.getElementById('form-name');
        let nameValue = name.value;

        if (session.get('token')?.split('.').length === 3) {
            nameValue = user.get('name');
        }

        if (nameValue.length == 0) {
            alert('Please fill name');
            return;
        }

        if (!id && name && session.get('token')?.split('.').length !== 3) {
            name.disabled = true;
        }

        const presence = document.getElementById('form-presence');
        if (!id && presence && presence.value == "0") {
            alert('Please select presence');
            return;
        }

        if (presence && presence.value != "0") {
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
            .body(dto.postCommentRequest(id, nameValue, presence ? presence.value === "1" : true, form.value))
            .send()
            .then((res) => res, () => null);

        if (name) {
            name.disabled = false;
        }

        form.disabled = false;
        if (cancel) {
            cancel.disabled = false;
        }

        if (presence) {
            presence.disabled = false;
        }

        btn.restore();

        if (response?.code !== 201) {
            return;
        }

        owns.set(response.data.uuid, response.data.own);
        form.value = null;

        if (presence) {
            presence.value = "0";
        }

        if (!id) {
            const newPage = await pagination.reset();
            if (newPage) {
                document.getElementById('comments').scrollIntoView({ behavior: 'smooth' });
                return;
            }

            const dtoPostComment = dto.postCommentResponse(response.data);
            dtoPostComment.is_admin = session.get('token')?.split('.').length === 3;
            const newComment = card.renderContent(dtoPostComment);

            document.getElementById('comments').lastElementChild.remove();
            document.getElementById('comments').innerHTML = newComment + document.getElementById('comments').innerHTML;
            document.getElementById('comments').scrollIntoView({ behavior: 'smooth' });
        }

        if (id) {
            showHide.set('hidden', showHide.get('hidden').concat([dto.commentShowMore(response.data.uuid, true)]));
            showHide.set('show', showHide.get('show').concat([id]));

            changeButton(id, false);
            document.getElementById(`inner-${id}`).remove();

            const dtoPostComment = dto.postCommentResponse(response.data);
            dtoPostComment.is_admin = session.get('token')?.split('.').length === 3;
            document.getElementById(`${id}`).insertAdjacentHTML('beforeend', card.renderInnerContent(dtoPostComment));

            const containerDiv = document.getElementById(`button-${id}`);
            const anchorTag = containerDiv.querySelector('a');
            const uuids = [response.data.uuid];

            if (anchorTag) {
                if (anchorTag.getAttribute('data-show') === 'false') {
                    showOrHide(anchorTag);
                }

                anchorTag.remove();
            }

            containerDiv.querySelector(`button[onclick="like.like(this)"][data-uuid="${id}"]`).insertAdjacentHTML('beforebegin', card.renderReadMore(id, anchorTag ? anchorTag.getAttribute('data-uuids').split(',').concat(uuids) : uuids));
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

        await request(HTTP_GET, '/api/comment/' + id)
            .token(session.get('token'))
            .send()
            .then((res) => {
                if (res.code === 200) {
                    const inner = document.createElement('div');
                    inner.classList.add('my-2');
                    inner.id = `inner-${id}`;
                    inner.innerHTML = `
                    <label for="form-inner-${id}" class="form-label">Edit</label>
                    ${document.getElementById(id).getAttribute('data-parent') === 'true' && session.get('token')?.split('.').length !== 3 ? `
                    <select class="form-select shadow-sm mb-2 rounded-4" id="form-inner-presence-${id}">
                        <option value="1" ${res.data.presence ? 'selected' : ''}>Datang</option>
                        <option value="2" ${res.data.presence ? '' : 'selected'}>Berhalangan</option>
                    </select>` : ''}
                    <textarea class="form-control shadow-sm rounded-4 mb-2" id="form-inner-${id}" placeholder="Type update comment"></textarea>
                    <div class="d-flex flex-wrap justify-content-end align-items-center mb-0">
                        <button style="font-size: 0.8rem;" onclick="comment.cancel('${id}')" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-4 py-0 me-1">Cancel</button>
                        <button style="font-size: 0.8rem;" onclick="comment.update(this)" data-uuid="${id}" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-4 py-0">Update</button>
                    </div>`;
        
                    document.getElementById(`button-${id}`).insertAdjacentElement('afterend', inner);
                    document.getElementById(`form-inner-${id}`).value = res.data.comment;
                }
            });

        button.innerText = tmp;
    };

    const comment = async () => {
        card.renderLoading();
        const comments = document.getElementById('comments');
        const onNullComment = `<div class="h6 text-center fw-bold p-4 my-3 bg-theme-${theme.isDarkMode('dark', 'light')} rounded-4 shadow">Yuk bagikan undangan ini biar banyak komentarnya</div>`;

        return await request(HTTP_GET, `/api/comment?per=${pagination.getPer()}&next=${pagination.getNext()}`)
            .token(session.get('token'))
            .send()
            .then((res) => {
                pagination.setResultData(res.data.length);

                if (res.data.length === 0) {
                    comments.innerHTML = onNullComment;
                    return;
                }

                let arr = showHide.get('hidden');
                util.extractUUIDs(res.data).forEach((c) => {
                    if (!arr.find((i) => i.uuid === c)) {
                        arr.push(dto.commentShowMore(c));
                    }
                });
                showHide.set('hidden', arr);

                comments.setAttribute('data-loading', 'false');
                comments.innerHTML = res.data.map((comment) => card.renderContent(comment)).join('');
                res.data.forEach(card.fetchTracker);
            });
    };

    const showOrHide = (button) => {
        const ids = button.getAttribute('data-uuids').split(',');
        const show = button.getAttribute('data-show') === 'true';
        const uuid = button.getAttribute('data-uuid');

        if (show) {
            button.setAttribute('data-show', 'false');
            button.innerText = 'Show replies';
            button.innerText += ' (' + ids.length + ')';

            showHide.set('show', showHide.get('show').filter((item) => item !== uuid));
        } else {
            button.setAttribute('data-show', 'true');
            button.innerText = 'Hide replies';

            showHide.set('show', showHide.get('show').concat([uuid]));
        }

        for (const id of ids) {
            showHide.set('hidden', showHide.get('hidden').map((item) => {
                if (item.uuid === id) {
                    item.show = !show;
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

    const init = () => {
        if (!showHide.has('hidden')) {
            showHide.set('hidden', []);
        }

        if (!showHide.has('show')) {
            showHide.set('show', []);
        }
    };

    return {
        init,
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