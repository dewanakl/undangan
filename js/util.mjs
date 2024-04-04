export const util = (() => {

    const opacity = (id, speed = 0.01) => {
        let nm = document.getElementById(id);
        let op = parseInt(nm.style.opacity);
        let clear = null;

        clear = setInterval(() => {
            if (op >= 0) {
                nm.style.opacity = op.toString();
                op -= speed;
            } else {
                clearInterval(clear);
                clear = null;
                nm.remove();
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

    const disableButton = (button) => {

        button.disabled = true;
        let tmp = button.innerText;
        button.innerText = 'Loading..';

        const restore = () => {
            button.innerText = tmp;
            button.disabled = false;
        };

        return {
            restore
        };
    };

    return {
        opacity,
        escapeHtml,
        disableButton
    }
})();