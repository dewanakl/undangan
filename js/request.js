export const HTTP_GET = 'GET';
export const HTTP_POST = 'POST';
export const HTTP_PUT = 'PUT';
export const HTTP_PATCH = 'PATCH';
export const HTTP_DELETE = 'DELETE';

export const request = (method, path) => {

    let url = document.querySelector('body').getAttribute('data-url');
    let req = {
        method: method,
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
    };

    if (url.slice(-1) == '/') {
        url = url.slice(0, -1);
    }

    return {
        then(...params) {
            return fetch(url + path, req)
                .then((res) => res.json())
                .then((res) => {
                    if (res.error) {
                        throw res.error[0];
                    }

                    return res;
                })
                .then(...params)
                .catch((err) => alert(err));
        },
        download(...params) {
            return fetch(url + path, req)
                .then((res) => {
                    if (res.status === 200) {
                        return res;
                    }

                    return null;
                })
                .then(...params)
                .catch((err) => alert(err));
        },
        token(token) {
            if (token.split('.').length === 3) {
                req.headers.append('Authorization', 'Bearer ' + token);
                return this;
            }

            req.headers.append('x-access-key', token);
            return this;
        },
        body(body) {
            req.body = JSON.stringify(body);
            return this;
        },
    };
};
