import { dto } from './dto.js';
import { session } from './session.js';

export const HTTP_GET = 'GET';
export const HTTP_POST = 'POST';
export const HTTP_PUT = 'PUT';
export const HTTP_PATCH = 'PATCH';
export const HTTP_DELETE = 'DELETE';

export const request = (method, path) => {

    let url = document.body.getAttribute('data-url');
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
        /**
         * @template T
         * @param {((data: any) => T)=} transform
         * @returns {Promise<ReturnType<typeof dto.baseResponse<T>>>}
         */
        send(transform = null) {
            return fetch(url + path, req)
                .then((res) => res.json())
                .then((res) => {
                    if (res.error) {
                        throw res.error[0];
                    }

                    if (transform) {
                        res.data = transform(res.data);
                    }

                    return dto.baseResponse(res.code, res.data, res.error);
                })
                .catch((err) => {
                    alert(err);
                    throw err;
                });
        },
        download() {
            return fetch(url + path, req)
                .then((res) => {
                    if (res.status !== 200) {
                        return null;
                    }

                    const existingLink = document.querySelector('a[download]');
                    if (existingLink) {
                        document.body.removeChild(existingLink);
                    }

                    const filename = res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'download.csv';
                    return res.blob().then((blob) => ({ blob, filename }));
                })
                .then((res) => {
                    if (!res) {
                        return null;
                    }

                    const { blob, filename } = res;

                    const link = document.createElement('a');
                    const href = window.URL.createObjectURL(blob);

                    link.href = href;
                    link.download = filename;
                    document.body.appendChild(link);

                    link.click();

                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(href);

                })
                .catch((err) => {
                    alert(err);
                    throw err;
                });
        },
        token(token) {
            if (session.isAdmin()) {
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
