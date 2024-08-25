export const dto = (() => {
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
        likeCommentResponse,
        postCommentResponse,
        commentShowMore,
        postCommentRequest,
    };
})();