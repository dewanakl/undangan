import { util } from './util.js';
import { theme } from './theme.js';
import { session } from './session.js';
import { storage } from './storage.js';
import { pagination } from './pagination.js';

export const card = (() => {

    const user = storage('user');
    const owns = storage('owns');
    const likes = storage('likes');
    const config = storage('config');
    const tracker = storage('tracker');
    const showHide = storage('comment');

    const renderLoading = () => {
        const comments = document.getElementById('comments');
        if (comments.getAttribute('data-loading') === 'true') {
            return;
        }

        comments.setAttribute('data-loading', 'true');
        comments.innerHTML = `
        <div class="card-body bg-theme-${theme.isDarkMode('dark', 'light')} shadow p-3 mx-0 mt-0 mb-3 rounded-4">
            <div class="d-flex flex-wrap justify-content-between align-items-center placeholder-wave">
                <span class="placeholder bg-secondary col-5 rounded-3 my-1"></span>
                <span class="placeholder bg-secondary col-3 rounded-3 my-1"></span>
            </div>
            <hr class="text-${theme.isDarkMode('light', 'dark')} my-1">
            <p class="card-text placeholder-wave">
                <span class="placeholder bg-secondary col-6 rounded-3"></span>
                <span class="placeholder bg-secondary col-5 rounded-3"></span>
                <span class="placeholder bg-secondary col-12 rounded-3 my-1"></span>
            </p>
        </div>`.repeat(pagination.getPer());
    };

    const convertMarkdownToHTML = (input) => {
        const text = theme.isDarkMode('light', 'dark');
        const lists = [
            ['*', `<strong class="text-${text}">$1</strong>`],
            ['_', `<em class="text-${text}">$1</em>`],
            ['~', `<del class="text-${text}">$1</del>`],
            ['```', `<code class="font-monospace text-${text}">$1</code>`]
        ];

        lists.forEach((data) => {
            const k = data[0];
            const v = data[1];

            input = input.replace(new RegExp(`\\${k}(?=\\S)(.*?)(?<!\\s)\\${k}`, 'gs'), v);
        });

        return input;
    };

    const renderLike = (comment) => {
        return `
        <button style="font-size: 0.8rem;" onclick="like.like(this)" data-uuid="${comment.uuid}" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} ms-auto rounded-3 p-0">
            <div class="d-flex justify-content-start align-items-center">
                <p class="my-0 mx-1" data-count-like="${comment.like.love}">${comment.like.love}</p>
                <i class="me-1 ${likes.has(comment.uuid) ? 'fa-solid fa-heart text-danger' : 'fa-regular fa-heart'}"></i>
            </div>
        </button>`;
    };

    const renderAction = (comment) => {
        const btn = theme.isDarkMode('light', 'dark');

        let action = '<div class="d-flex flex-wrap justify-content-start align-items-center">';

        if (config.get('can_reply') == true || config.get('can_reply') === undefined) {
            action += `<button style="font-size: 0.8rem;" onclick="comment.reply(this)" data-uuid="${comment.uuid}" class="btn btn-sm btn-outline-${btn} rounded-4 py-0 me-1">Reply</button>`;
        }

        if (owns.has(comment.uuid) && (config.get('can_edit') == true || config.get('can_edit') === undefined)) {
            action += `<button style="font-size: 0.8rem;" onclick="comment.edit(this)" data-uuid="${comment.uuid}" class="btn btn-sm btn-outline-${btn} rounded-4 py-0 me-1">Edit</button>`;
        }

        if (session.isAdmin()) {
            action += `<button style="font-size: 0.8rem;" onclick="comment.remove(this)" data-uuid="${comment.uuid}" class="btn btn-sm btn-outline-${btn} rounded-4 py-0" data-own="${comment.own}">Delete</button>`;
        } else if (owns.has(comment.uuid) && (config.get('can_delete') == true || config.get('can_delete') === undefined)) {
            action += `<button style="font-size: 0.8rem;" onclick="comment.remove(this)" data-uuid="${comment.uuid}" class="btn btn-sm btn-outline-${btn} rounded-4 py-0">Delete</button>`;
        }

        action += '</div>';

        return action;
    };

    const renderReadMore = (uuid, comments) => {
        const hasId = showHide.get('show').includes(uuid);
        return `<a style="font-size: 0.8rem;" onclick="comment.showOrHide(this)" data-uuid="${uuid}" data-uuids="${comments.join(',')}" data-show="${hasId ? 'true' : 'false'}" role="button" class="me-auto ms-1 py-0">${hasId ? 'Hide replies' : `Show replies (${comments.length})`}</a>`;
    };

    const renderButton = (comment) => {
        return `
        <div class="d-flex flex-wrap justify-content-between align-items-center" id="button-${comment.uuid}">
            ${renderAction(comment)}
            ${comment.comments.length > 0 ? renderReadMore(comment.uuid, comment.comments.map((c) => c.uuid)) : ''}
            ${renderLike(comment)}
        </div>`;
    };

    const renderTracker = (comment) => {
        if (comment.ip === undefined || comment.user_agent === undefined || comment.is_admin) {
            return '';
        }

        const text = theme.isDarkMode('light', 'dark');
        return `
        <div class="p-2 my-2 rounded-3 border">
            <p class="text-${text} mb-1 mx-0 mt-0 p-0" style="font-size: 0.7rem;" id="ip-${comment.uuid}"><i class="fa-solid fa-location-dot me-1"></i>${util.escapeHtml(comment.ip)} ${tracker.has(comment.ip) ? `<strong>${tracker.get(comment.ip)}</strong>` : `<span class="mb-1 placeholder col-2 rounded-3"></span>`}</p>
            <p class="text-${text} m-0 p-0" style="font-size: 0.7rem;"><i class="fa-solid fa-mobile-screen-button me-1"></i>${util.escapeHtml(comment.user_agent)}</p>
        </div>`;
    };

    const renderHeader = (comment, is_parent) => {
        const btn = theme.isDarkMode('dark', 'light');

        if (is_parent) {
            return `class="card-body bg-theme-${btn} shadow p-3 mx-0 mt-0 mb-3 rounded-4" data-parent="true"`;
        }

        return `class="${!showHide.get('hidden').find((item) => item.uuid === comment.uuid)['show'] ? 'd-none' : ''} card-body overflow-x-scroll mw-100 border-start bg-theme-${btn} py-2 ps-2 pe-0 my-2 ms-2 me-0"`;
    };

    const renderTitle = (comment, is_parent) => {
        if (comment.is_admin) {
            return `<strong class="me-1">${util.escapeHtml(user.get('name') ?? config.get('name'))}</strong><i class="fa-solid fa-certificate text-primary"></i>`;
        }

        if (is_parent) {
            return `<strong class="me-1">${util.escapeHtml(comment.name)}</strong><i id="badge-${comment.uuid}" class="fa-solid ${comment.presence ? 'fa-circle-check text-success' : 'fa-circle-xmark text-danger'}"></i>`;
        }

        return `<strong>${util.escapeHtml(comment.name)}</strong>`;
    };

    const renderBody = (comment, is_parent) => {
        const text = theme.isDarkMode('light', 'dark');

        return `
        <div class="d-flex flex-wrap justify-content-between align-items-center">
            <p class="text-${text} text-truncate m-0 p-0">${renderTitle(comment, is_parent)}</p>
            <small class="text-${text} m-0 p-0" style="font-size: 0.75rem;">${comment.created_at}</small>
        </div>
        <hr class="text-${text} my-1">
        <p class="text-${text} mt-0 mb-1 mx-0 p-0" style="white-space: pre-wrap !important; font-size: 0.95rem;" id="content-${comment.uuid}">${convertMarkdownToHTML(util.escapeHtml(comment.comment))}</p>`;
    };

    const renderContent = (comment, is_parent) => {
        return `
        <div ${renderHeader(comment, is_parent)} id="${comment.uuid}">
            <div id="body-content-${comment.uuid}" data-tapTime="0" data-liked="false" ontouchend="like.tapTap(this)">
            ${renderBody(comment, is_parent)}
            </div>
            ${renderTracker(comment)}
            ${renderButton(comment)}
            <div id="reply-content-${comment.uuid}">${comment.comments.map((c) => renderInnerContent(c)).join('')}</div>
        </div>`;
    };

    const renderInnerContent = (comment) => {
        return renderContent(comment, false);
    };

    const renderReply = (id) => {
        const inner = document.createElement('div');
        inner.classList.add('my-2');
        inner.id = `inner-${id}`;
        inner.innerHTML = `
        <label for="form-inner-${id}" class="form-label" style="font-size: 0.95rem;"><i class="fa-solid fa-reply me-1"></i>Reply</label>
        <textarea class="form-control shadow-sm rounded-4 mb-2" id="form-inner-${id}" placeholder="Type reply comment"></textarea>
        <div class="d-flex flex-wrap justify-content-end align-items-center mb-0">
            <button style="font-size: 0.8rem;" onclick="comment.cancel('${id}')" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-4 py-0 me-1">Cancel</button>
            <button style="font-size: 0.8rem;" onclick="comment.send(this)" data-uuid="${id}" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-4 py-0">Send</button>
        </div>`;

        return inner;
    };

    const renderEdit = (id, presence) => {
        const inner = document.createElement('div');
        inner.classList.add('my-2');
        inner.id = `inner-${id}`;
        inner.innerHTML = `
        <label for="form-inner-${id}" class="form-label" style="font-size: 0.95rem;"><i class="fa-solid fa-pen me-1"></i>Edit</label>
        ${document.getElementById(id).getAttribute('data-parent') === 'true' && !session.isAdmin() ? `
        <select class="form-select shadow-sm mb-2 rounded-4" id="form-inner-presence-${id}">
            <option value="1" ${presence ? 'selected' : ''}>Datang</option>
            <option value="2" ${presence ? '' : 'selected'}>Berhalangan</option>
        </select>` : ''}
        <textarea class="form-control shadow-sm rounded-4 mb-2" id="form-inner-${id}" data-original="" placeholder="Type update comment"></textarea>
        <div class="d-flex flex-wrap justify-content-end align-items-center mb-0">
            <button style="font-size: 0.8rem;" onclick="comment.cancel('${id}')" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-4 py-0 me-1">Cancel</button>
            <button style="font-size: 0.8rem;" onclick="comment.update(this)" data-uuid="${id}" class="btn btn-sm btn-outline-${theme.isDarkMode('light', 'dark')} rounded-4 py-0">Update</button>
        </div>`;

        return inner;
    };

    const fetchTracker = (comment) => {
        comment.comments.forEach((c) => {
            fetchTracker(c);
        });

        if (comment.ip === undefined || comment.user_agent === undefined || comment.is_admin || tracker.has(comment.ip)) {
            return;
        }

        fetch(`https://freeipapi.com/api/json/${comment.ip}`)
            .then((res) => res.json())
            .then((res) => {
                let result = res.cityName + ' - ' + res.regionName;

                if (res.cityName == '-' && res.regionName == '-') {
                    result = 'localhost';
                }

                tracker.set(comment.ip, result);
                document.getElementById(`ip-${comment.uuid}`).innerHTML = `<i class="fa-solid fa-location-dot me-1"></i>${util.escapeHtml(comment.ip)} <strong>${result}</strong>`;
            })
            .catch((err) => {
                document.getElementById(`ip-${comment.uuid}`).innerHTML = `<i class="fa-solid fa-location-dot me-1"></i>${util.escapeHtml(comment.ip)} <strong>${util.escapeHtml(err.message)}</strong>`;
            });
    };

    return {
        renderEdit,
        renderReply,
        fetchTracker,
        renderLoading,
        renderReadMore,
        renderInnerContent,
        renderContent: (comment) => renderContent(comment, true),
        convertMarkdownToHTML
    }
})();