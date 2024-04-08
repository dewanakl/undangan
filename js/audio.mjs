export const audio = (() => {

    const music = document.getElementById('button-music');
    let audio = null;

    const getAudio = () => {
        if (!audio) {
            audio = new Audio();
            audio.src = music.getAttribute('data-url');
            audio.load();
            audio.currentTime = 0;
            audio.autoplay = true;
            audio.muted = false;
            audio.loop = true;
            audio.volume = 1;
        }

        return audio;
    };

    const play = () => getAudio().play();
    const pause = () => getAudio().pause();

    const button = (button) => {
        if (button.getAttribute('data-status') !== 'true') {
            button.setAttribute('data-status', 'true');
            play();
            button.innerHTML = '<i class="fa-solid fa-circle-pause spin-button"></i>';
            return;
        }

        button.setAttribute('data-status', 'false');
        pause();
        button.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    };

    const showButton = () => {
        music.style.display = 'block';
    };

    return {
        play,
        pause,
        button,
        showButton,
    };
})();