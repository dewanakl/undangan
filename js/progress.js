import { util } from "./util.js";

export const progress = (() => {
    const assets = document.querySelectorAll("img");
    const info = document.getElementById("progress-info");
    const btnEnvelope = document.getElementById("btn-envelope");

    const total = assets.length;
    let loaded = 0;

    const progress = () => {
        loaded += 1;

        var percentage = parseInt((loaded / total) * 100).toFixed(0);

        console.log("progress: ", percentage);

        info.innerText = `${percentage}%`;

        if (loaded == total) {
            btnEnvelope.style.display = "block";
            info.style.display = "none";
        }
    };

    info.style.display = "block";
    assets.forEach((asset) => {
        if (asset.complete && asset.naturalWidth !== 0) {
            progress();
        } else {
            asset.addEventListener("load", () => progress());
        }
    });
})();
