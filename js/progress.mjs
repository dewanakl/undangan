import { util } from "./util.mjs";

export const progress = (() => {

    const assets = document.querySelectorAll('img');
    const info = document.getElementById('progress-info');
    const bar = document.getElementById('progress-bar');

    const total = assets.length;
    let loaded = 0;

    const progress = () => {
        loaded += 1;

        bar.style.width = Math.min((loaded / total) * 100, 100).toString() + "%";
        info.innerText = `Loading assets (${loaded}/${total}) [${parseInt((loaded / total) * 100).toFixed(0)}%]`;

        if (loaded == total) {
            util.show();
        }
    };

    info.style.display = 'block';
    assets.forEach((asset) => {
        if (asset.complete && asset.naturalWidth !== 0) {
            progress();
        } else {
            asset.addEventListener('load', () => progress());
        }
    });
})();