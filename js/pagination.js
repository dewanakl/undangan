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

    const buttonAction = async (button, type) => {
        button.disabled = true;
        const tmp = button.innerHTML;

        button.innerHTML = `${type == 'Next' ? type : ''}<div class="spinner-border spinner-border-sm my-0 mx-1 p-0" style="height: 0.8rem; width: 0.8rem;"></div>${type == 'Prev' ? type : ''}`;
        await comment.comment();

        button.disabled = false;
        button.innerHTML = tmp;

        comment.scroll();
    };

    const reset = async () => {
        if (pageNow == 0) {
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
        if (resultData < perPage) {
            disabledNext();
            return;
        }

        enableNext();
    };

    const previous = async (button) => {
        disabledPrevious();

        if (pageNow >= 0) {
            pageNow -= perPage;

            disabledNext();
            await buttonAction(button, 'Prev');
            page.innerText = parseInt(page.innerText) - 1;

            if (pageNow > 0) {
                enablePrevious();
            }
        }
    };

    const next = async (button) => {
        disabledNext();

        if (resultData >= perPage) {
            pageNow += perPage;

            disabledPrevious();
            await buttonAction(button, 'Next');
            page.innerText = parseInt(page.innerText) + 1;

            enablePrevious();
        }
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
