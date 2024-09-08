import { util } from './util.js';
import { guest } from './guest.js';

export const progress = (() => {

    let info = null;
    let bar = null;

    let total = 0;
    let loaded = 0;
    let valid = true;
    let push = true;

    const onComplete = () => {
        guest.name();
        util.opacity('loading', 0.025);
    };

    const complete = (type) => {
        if (!valid) {
            return;
        }

        loaded += 1;
        bar.style.width = Math.min((loaded / total) * 100, 100).toString() + "%";
        info.innerText = `Loading ${type} complete (${loaded}/${total}) [${parseInt((loaded / total) * 100).toFixed(0)}%]`;

        if (loaded === total) {
            onComplete();
        }
    };

    const add = () => {
        if (!push) {
            return;
        }

        total += 1;
    };

    const invalid = (type) => {
        info.innerText = `Error loading ${type} (${loaded}/${total}) [${parseInt((loaded / total) * 100).toFixed(0)}%]`;
        bar.style.backgroundColor = 'red';
        valid = false;
    };

    const run = async () => {
        document.querySelectorAll('img').forEach((asset) => {
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

    const init = () => {
        document.querySelectorAll('img').forEach(add);

        info = document.getElementById('progress-info');
        bar = document.getElementById('progress-bar');
        info.style.display = 'block';

        push = false;
        run();
    };

    return {
        init,
        add,
        invalid,
        complete,
    };
})();