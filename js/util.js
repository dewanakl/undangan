import { storage } from './storage.js';
import { bootstrap } from './bootstrap.js';

export const util = (() => {

    const opacity = (id, speed = 0.01) => {
        const element = document.getElementById(id);
        let op = parseInt(element.style.opacity);

        let clear = null;
        clear = setInterval(() => {
            if (op > 0) {
                element.style.opacity = op.toString();
                op -= speed;
            } else {
                clearInterval(clear);
                clear = null;
                element.remove();
            }
        }, 10);
    };

    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const disableButton = (button, message = 'Loading..') => {

        button.disabled = true;
        let tmp = button.innerHTML;
        button.innerHTML = message;

        const restore = () => {
            button.innerHTML = tmp;
            button.disabled = false;
        };

        return {
            restore,
        };
    };

    const animate = (svg, timeout, classes) => {
        setTimeout(() => {
            svg.classList.add(classes);
        }, timeout);
    };

    const modal = (img) => {
        document.getElementById('show-modal-image').src = img.src;
        (new bootstrap.Modal('#modal-image')).show();
    };

    const copy = async (button, message, timeout = 1500) => {
        try {
            await navigator.clipboard.writeText(button.getAttribute('data-copy'));
        } catch {
            alert('Failed to copy');
            return;
        }

        button.disabled = true;
        let tmp = button.innerText;
        button.innerText = message;

        let clear = null;
        clear = setTimeout(() => {
            button.disabled = false;
            button.innerText = tmp;

            clearTimeout(clear);
            clear = null;
            return;
        }, timeout);
    };

    const close = () => {
        storage('information').set('info', true);
    };

    const extractUUIDs = (data) => {
        let uuids = [];

        const traverseComments = (comments) => {
            comments.forEach((comment) => {
                uuids.push(comment.uuid);
                if (comment.comments && comment.comments.length > 0) {
                    traverseComments(comment.comments);
                }
            });
        };

        data.forEach((item) => {
            uuids.push(item.uuid);
            if (item.comments && item.comments.length > 0) {
                traverseComments(item.comments);
            }
        });

        return uuids;
    };

    return {
        open,
        copy,
        close,
        modal,
        opacity,
        animate,
        escapeHtml,
        extractUUIDs,
        disableButton,
    }
})();