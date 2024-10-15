import { comment } from './comment.js';

export const pagination = (() => {

    let perPage = 10;
    let pageNow = 0;
    let resultData = 0;

    let page = null;
    let liPrev = null;
    let liNext = null;

    const setPer = (num) => {
        perPage = Number(num);
    };

    const getPer = () => perPage;

    const getNext = () => pageNow;

    const disabledPrevious = () => !liPrev.classList.contains('disabled') ? liPrev.classList.add('disabled') : null;

    const enablePrevious = () => liPrev.classList.contains('disabled') ? liPrev.classList.remove('disabled') : null;

    const disabledNext = () => !liNext.classList.contains('disabled') ? liNext.classList.add('disabled') : null;

    const enableNext = () => liNext.classList.contains('disabled') ? liNext.classList.remove('disabled') : null;

    const enablePagination = () => {
        const pagination = document.getElementById('pagination');
        if (pagination.classList.contains('d-none')) {
            pagination.classList.remove('d-none');
        }
    };

    const buttonAction = (button) => {
        button.disabled = true;
        const tmp = button.innerHTML;
        button.innerHTML = `<div class="spinner-border spinner-border-sm my-0 mx-1 p-0" style="height: 0.8rem; width: 0.8rem;"></div>`;

        const process = async () => {
            await comment.comment();

            button.disabled = false;
            button.innerHTML = tmp;

            comment.scroll();
        };

        const next = async () => {
            pageNow += perPage;

            button.innerHTML = 'Next' + button.innerHTML;
            await process();
            page.innerText = parseInt(page.innerText) + 1;
        };

        const prev = async () => {
            pageNow -= perPage;

            button.innerHTML = button.innerHTML + 'Prev';
            await process();
            page.innerText = parseInt(page.innerText) - 1;
        };

        return {
            next,
            prev,
        };
    };

    const reset = async () => {
        if (pageNow === 0) {
            return false;
        }

        pageNow = 0;
        resultData = 0;
        page.innerText = 1;

        disabledNext();
        disabledPrevious();
        await comment.comment();

        return true;
    };

    const setResultData = (len) => {
        resultData = len;

        if (pageNow > 0) {
            enablePrevious();
        }

        if (resultData < perPage) {
            disabledNext();
            return;
        }

        enableNext();
        enablePagination();
    };

    const previous = async (button) => {
        disabledPrevious();

        if (pageNow < 0) {
            return;
        }

        disabledNext();
        await buttonAction(button).prev();
    };

    const next = async (button) => {
        disabledNext();

        if (resultData < perPage) {
            return;
        }

        disabledPrevious();
        await buttonAction(button).next();
    };

    const init = () => {
        page = document.getElementById('page');
        liPrev = document.getElementById('previous');
        liNext = document.getElementById('next');
    };

    return {
        init,
        setPer,
        getPer,
        getNext,
        reset,
        setResultData,
        previous,
        next,
    };
})();
