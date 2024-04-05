import { card } from './card.mjs';
import { util } from './util.mjs';
import { theme } from './theme.mjs';
import { storage } from './storage.mjs';
import { pagination } from './pagination.mjs';
import { request, HTTP_GET, HTTP_POST, HTTP_DELETE, HTTP_PUT } from "./request.mjs";

export const comment = (() => {

    const owns = storage('owns');
    const session = storage('session');

    const remove = async (button) => {
        if (!confirm('Are you sure?')) {
            return;
        }

        const id = button.getAttribute('data-uuid');

        if (session.get('token')) {
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

    const enabledButton = (id) => {
        const buttonMethod = ['reply', 'edit', 'remove'];

        buttonMethod.forEach((v) => {
            const status = document.querySelector(`[onclick="comment.${v}(this)"][data-uuid="${id}"]`);
            if (status) {
                status.disabled = false;
            }
        });
    };

    const update = async (button) => {
        const id = button.getAttribute('data-uuid');

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
                comment: form.value
            })
            .then((res) => res.data.status);

        form.disabled = false;
        if (cancel) {
            cancel.disabled = false;
        }

        btn.restore();

        if (status) {
            document.getElementById(`inner-${id}`).remove();
            document.getElementById(`content-${id}`).innerHTML = card.convertMarkdownToHTML(util.escapeHtml(form.value));
            enabledButton(id);
        }
    };

    const send = async (button) => {
        const id = button.getAttribute('data-uuid');

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
                name: '---',
                presence: true,
                comment: form.value
            })
            .then();

        form.disabled = false;
        if (cancel) {
            cancel.disabled = false;
        }

        btn.restore();

        if (response?.code === 201) {
            owns.set(response.data.uuid, response.data.own);
            form.value = null;
            comment();
        }
    };

    const cancel = (id) => {
        if (document.getElementById(`form-inner-${id}`).value.length === 0 || confirm('Are you sure?')) {
            enabledButton(id);
            document.getElementById(`inner-${id}`).remove();
        }
    };

    const reply = (button) => {
        const id = button.getAttribute('data-uuid');

        if (document.getElementById(`inner-${id}`)) {
            return;
        }

        const update = document.querySelector(`[onclick="comment.edit(this)"][data-uuid="${id}"]`);
        if (update) {
            update.disabled = true;
        }

        const remove = document.querySelector(`[onclick="comment.remove(this)"][data-uuid="${id}"]`);
        if (remove) {
            remove.disabled = true;
        }

        const inner = document.createElement('div');
        inner.classList.add('my-2');
        inner.id = `inner-${id}`;
        inner.innerHTML = `
        <textarea class="form-control shadow-sm rounded-3 mb-2" id="form-inner-${id}" placeholder="Type reply comment"></textarea>
        <div class="d-flex flex-wrap justify-content-end align-items-center mb-0">
            <button style="font-size: 0.8rem;" onclick="comment.cancel('${id}')" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-3 py-0 me-1">Cancel</button>
            <button style="font-size: 0.8rem;" onclick="comment.send(this)" data-uuid="${id}" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-3 py-0">Send</button>
        </div>`;

        document.getElementById(`button-${id}`).insertAdjacentElement('afterend', inner);
    };

    const edit = async (button) => {
        const id = button.getAttribute('data-uuid');

        if (document.getElementById(`inner-${id}`)) {
            return;
        }

        const reply = document.querySelector(`[onclick="comment.reply(this)"][data-uuid="${id}"]`);
        if (reply) {
            reply.disabled = true;
        }

        const remove = document.querySelector(`[onclick="comment.remove(this)"][data-uuid="${id}"]`);
        if (remove) {
            remove.disabled = true;
        }

        const btn = util.disableButton(button);

        const status = await request(HTTP_GET, '/api/comment/' + id)
            .token(session.get('token'))
            .then((res) => res);

        if (status?.code === 200) {
            const inner = document.createElement('div');
            inner.classList.add('my-2');
            inner.id = `inner-${id}`;
            inner.innerHTML = `
            <textarea class="form-control shadow-sm rounded-3 mb-2" id="form-inner-${id}" placeholder="Type update comment"></textarea>
            <div class="d-flex flex-wrap justify-content-end align-items-center mb-0">
                <button style="font-size: 0.8rem;" onclick="comment.cancel('${id}')" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-3 py-0 me-1">Cancel</button>
                <button style="font-size: 0.8rem;" onclick="comment.update(this)" data-uuid="${id}" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-3 py-0">Update</button>
            </div>`;

            document.getElementById(`button-${id}`).insertAdjacentElement('afterend', inner);
            document.getElementById(`form-inner-${id}`).value = status.data.comment;
        }

        btn.restore();
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

                comments.innerHTML = res.data.map((comment) => card.renderContent(comment)).join('');
            });
    };

    return {
        cancel,
        send,
        edit,
        reply,
        remove,
        update,
        comment,
        renderLoading: card.renderLoading,
    }
})();