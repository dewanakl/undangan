import { comment } from "./comment.mjs";

export const pagination = (() => {

    const perPage = 10;
    let pageNow = 0;
    let resultData = 0;

    const page = document.getElementById('page');
    const buttonPrev = document.getElementById('previous');
    const buttonNext = document.getElementById('next');

    const disabledPrevious = () => {
        buttonPrev.classList.add('disabled');
    };

    const disabledNext = () => {
        buttonNext.classList.add('disabled');
    };

    const buttonAction = async (button, type) => {
        let tmp = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `${type == 'Next' ? type : ''}<span class="spinner-border spinner-border-sm mx-1"></span>${type == 'Previous' ? type : ''}`;

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
        pageNow = 0;
        resultData = 0;
        page.innerText = 1;
        buttonNext.classList.remove('disabled');
        await comment.comment();
        disabledPrevious();
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

            await buttonAction(button, 'Previous');
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

    return {
        getPer,
        getNext,
        reset,
        setResultData,
        previous,
        next,
    };
})();
