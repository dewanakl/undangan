import { storage } from './storage.js';
import { confetti } from './confetti.js';
import { request, HTTP_PATCH, HTTP_POST } from './request.js';

export const like = (() => {

    const likes = storage('likes');
    const session = storage('session');

    const like = async (button) => {
        const id = button.getAttribute('data-uuid');

        const heart = button.firstElementChild.lastElementChild;
        const info = button.firstElementChild.firstElementChild;

        button.disabled = true;

        if (likes.has(id)) {
            await request(HTTP_PATCH, '/api/comment/' + likes.get(id))
                .token(session.get('token'))
                .send()
                .then((res) => {
                    if (res.data.status) {
                        likes.unset(id);

                        heart.classList.remove('fa-solid', 'text-danger');
                        heart.classList.add('fa-regular');

                        info.setAttribute('data-count-like', (parseInt(info.getAttribute('data-count-like')) - 1).toString());
                    }
                });

            info.innerText = info.getAttribute('data-count-like');
            button.disabled = false;

            return;
        }

        await request(HTTP_POST, '/api/comment/' + id)
            .token(session.get('token'))
            .send()
            .then((res) => {
                if (res.code == 201) {
                    likes.set(id, res.data.uuid);

                    heart.classList.remove('fa-regular');
                    heart.classList.add('fa-solid', 'text-danger');

                    info.setAttribute('data-count-like', (parseInt(info.getAttribute('data-count-like')) + 1).toString());
                }
            });

        info.innerText = info.getAttribute('data-count-like');
        button.disabled = false;
    };

    const animation = (card) => {
        if (!confetti) {
            return;
        }

        const end = Date.now() + 25;
        const colors = ['#ff69b4', '#ff1493'];

        const yPosition = Math.max(0.3, Math.min(1, (card.getBoundingClientRect().top / window.innerHeight) + 0.2));

        const heart = confetti.shapeFromPath({
            path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
            matrix: [0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333]
        });

        (function frame() {

            colors.forEach((color) => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    shapes: [heart],
                    origin: { x: 0, y: yPosition },
                    zIndex: 1057,
                    colors: [color]
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    shapes: [heart],
                    origin: { x: 1, y: yPosition },
                    zIndex: 1057,
                    colors: [color]
                });
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    const tapTap = async (div) => {
        const currentTime = (new Date()).getTime();
        const tapLength = currentTime - parseInt(div.getAttribute('data-tapTime'));
        const uuid = div.id.replace('body-content-', '');

        if (tapLength < 300 && tapLength > 0 && !likes.has(uuid) && div.getAttribute('data-liked') !== 'true') {
            animation(div);
            div.setAttribute('data-liked', 'true');
            await like(document.querySelector(`[onclick="like.like(this)"][data-uuid="${uuid}"]`));
            div.setAttribute('data-liked', 'false');
        }

        div.setAttribute('data-tapTime', currentTime);
    };

    return {
        like,
        tapTap,
    };
})();