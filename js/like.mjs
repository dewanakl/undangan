import { storage } from "./storage.mjs";
import { request, HTTP_PATCH, HTTP_POST } from "./request.mjs";

export const like = (() => {

    const likes = storage('likes');
    const session = storage('session');

    const like = async (button) => {
        let id = button.getAttribute('data-uuid');

        let heart = button.firstElementChild.lastElementChild;
        let info = button.firstElementChild.firstElementChild;

        button.disabled = true;
        let tmp = info.innerText;
        info.innerText = 'Loading..';

        if (likes.has(id)) {
            await request(HTTP_PATCH, '/api/comment/' + likes.get(id))
                .token(session.get('token'))
                .then((res) => {
                    if (res.data.status) {
                        likes.unset(id);

                        heart.classList.remove('fa-solid', 'text-danger');
                        heart.classList.add('fa-regular');

                        info.setAttribute('data-count-like', (parseInt(info.getAttribute('data-count-like')) - 1).toString());
                    }
                });

            info.innerText = info.getAttribute('data-count-like') + ' ' + tmp.split(' ')[1];
            button.disabled = false;

            return;
        }

        await request(HTTP_POST, '/api/comment/' + id)
            .token(session.get('token'))
            .then((res) => {
                if (res.code == 201) {
                    likes.set(id, res.data.uuid);

                    heart.classList.remove('fa-regular');
                    heart.classList.add('fa-solid', 'text-danger');

                    info.setAttribute('data-count-like', (parseInt(info.getAttribute('data-count-like')) + 1).toString());
                }
            });


        info.innerText = info.getAttribute('data-count-like') + ' ' + tmp.split(' ')[1];
        button.disabled = false;
    };

    return { like };
})();