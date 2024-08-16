import { like } from './like.js';
import { user } from './user.js';
import { theme } from './theme.js';
import { navbar } from './navbar.js';
import { session } from './session.js';
import { comment } from './comment.js';
import { pagination } from './pagination.js';

document.addEventListener('DOMContentLoaded', () => {
    theme.check();
    session.init();
    comment.init();
    pagination.init();

    window.like = like;
    window.user = user;
    window.theme = theme;
    window.navbar = navbar;
    window.session = session;
    window.comment = comment;
    window.pagination = pagination;
});