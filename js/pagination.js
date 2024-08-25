import { comment } from './comment.js';

export const pagination = (() => {

    let perPage = 10;
    let pageNow = 0;
    let resultData = 0;

    let page = null;
    let buttonPrev = null;
    let buttonNext = null;

    const setPer = (num) => {
        perPage = Number(num);
    };

    const disabledPrevious = () => {
        buttonPrev.classList.add('disabled');
    };

    const disabledNext = () => {
        buttonNext.classList.add('disabled');
    };

    const buttonAction = async (button, type) => {
        let tmp = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `${type == 'Next' ? type : ''}<span class="spinner-border spinner-border-sm mx-1"></span>${type == 'Prev' ? type : ''}`;

        await comment.comment();
        document.getElementById('comments').scrollIntoView({ behavior: 'smooth' });

        button.disabled = false;
        button.innerHTML = tmp;
    };

    const getPer = () => {
        return perPage;
    };

    const getNext = () => {
        return pageNow;
    };

    const reset = async () => {
        if (pageNow == 0) {
            return false;
        }

        pageNow = 0;
        resultData = 0;
        page.innerText = 1;
        buttonNext.classList.remove('disabled');
        await comment.comment();
        disabledPrevious();

        return true;
    };

    const setResultData = (len) => {
        resultData = len;
        if (resultData < perPage) {
            disabledNext();
        }
    };

    const previous = async (button) => {
        if (pageNow < 0) {
            disabledPrevious();
        } else {
            pageNow -= perPage;
            disabledNext();

            await buttonAction(button, 'Prev');
            page.innerText = parseInt(page.innerText) - 1;
            buttonNext.classList.remove('disabled');

            if (pageNow <= 0) {
                disabledPrevious();
            }
        }
    };

    const next = async (button) => {
        if (resultData < perPage) {
            disabledNext();
        } else {
            pageNow += perPage;
            disabledPrevious();

            await buttonAction(button, 'Next');
            page.innerText = parseInt(page.innerText) + 1;
            buttonPrev.classList.remove('disabled');
        }
    };

    const init = () => {
        page = document.getElementById('page');
        buttonPrev = document.getElementById('previous');
        buttonNext = document.getElementById('next');
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
