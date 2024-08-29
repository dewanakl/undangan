export const dto = (() => {
    /**
     * Generates a base response object containing code, data, and error properties.
     * 
     * @template T
     * @param {number} code
     * @param {T} data
     * @param {string[]=} error
     * @returns {{code: number, data: T, error?: string[]}} The response object containing the code, data, and error.
     */
    const baseResponse = (code, data, error) => {
        return {
            code,
            data,
            error,
        };
    };

    const likeCommentResponse = ((love = 0) => {
        return {
            love,
        };
    });

    const postCommentResponse = (({ uuid, own, name, presence, comment, created_at }) => {
        let is_admin;
        let comments = [];
        let like = likeCommentResponse();

        return {
            uuid,
            own,
            name,
            presence,
            comment,
            is_admin,
            created_at,
            comments,
            like,
        };
    });

    const commentShowMore = ((uuid, show = false) => {
        return {
            uuid,
            show,
        }
    });

    const postCommentRequest = ((id, name, presence, comment) => {
        return {
            id,
            name,
            presence,
            comment,
        };
    });

    return {
        baseResponse,
        likeCommentResponse,
        postCommentResponse,
        commentShowMore,
        postCommentRequest,
    };
})();