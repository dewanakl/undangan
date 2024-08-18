export const audio = (() => {

    let music = null;
    let audio = null;

    const init = () => {
        music = document.getElementById('button-music');

        audio = new Audio(music.getAttribute('data-url'));
        audio.currentTime = 0;
        audio.autoplay = false;
        audio.muted = false;
        audio.loop = true;
        audio.volume = 1;
        audio.controls = false;
        audio.preload = 'auto';
    };

    const button = async (button) => {
        if (button.getAttribute('data-status') !== 'true') {
            await audio.play();
            button.setAttribute('data-status', 'true');
            button.innerHTML = '<i class="fa-solid fa-circle-pause spin-button"></i>';
            return;
        }

        button.setAttribute('data-status', 'false');
        audio.pause();
        button.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    };

    const showButton = () => {
        music.style.display = 'block';
    };

    return {
        init,
        play: () => audio.play(),
        button,
        showButton,
    };
})();