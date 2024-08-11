export const audio = (() => {

    let music = null;
    let audio = null;

    const init = () => {
        music = document.getElementById('button-music');

        audio = new Audio();
        audio.src = music.getAttribute('data-url');
        audio.load();
        audio.currentTime = 0;
        audio.autoplay = true;
        audio.muted = false;
        audio.loop = true;
        audio.volume = 1;
    };

    const button = (button) => {
        if (button.getAttribute('data-status') !== 'true') {
            button.setAttribute('data-status', 'true');
            audio.play();
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