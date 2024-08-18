import { util } from './util.js';

export const progress = (() => {

    let info = null;
    let bar = null;

    let total = 0;
    let loaded = 0;
    let valid = true;

    const complete = (type) => {
        if (!valid) {
            return;
        }

        loaded += 1;

        bar.style.width = Math.min((loaded / total) * 100, 100).toString() + "%";
        info.innerText = `Loading ${type} complete (${loaded}/${total}) [${parseInt((loaded / total) * 100).toFixed(0)}%]`;

        if (loaded === total) {
            util.guest();
            util.opacity('loading', 0.025);
        }
    };

    const add = () => {
        total = total + 1;
    };

    const invalid = (type) => {
        info.innerText = `Error loading ${type} (${loaded}/${total}) [${parseInt((loaded / total) * 100).toFixed(0)}%]`;
        bar.style.backgroundColor = 'red';
        valid = false;
    };

    const init = () => {
        const assets = document.querySelectorAll('img');

        info = document.getElementById('progress-info');
        bar = document.getElementById('progress-bar');
        info.style.display = 'block';

        assets.forEach(add);
        assets.forEach((asset) => {
            asset.onerror = () => {
                invalid('image');
            };
            asset.onload = () => {
                complete('image');
            };

            if (asset.complete && asset.naturalWidth !== 0 && asset.naturalHeight !== 0) {
                complete('image');
            } else if (asset.complete) {
                invalid('image');
            }
        });
    };

    return {
        init,
        add,
        invalid,
        complete,
    };
})();