import { like } from './like.js';
import { admin } from './admin.js';
import { theme } from './theme.js';
import { navbar } from './navbar.js';
import { session } from './session.js';
import { comment } from './comment.js';
import { pagination } from './pagination.js';

document.addEventListener('DOMContentLoaded', () => {
    theme.check();
    comment.init();
    pagination.init();
    
    admin.init();

    window.like = like;
    window.admin = admin;
    window.theme = theme;
    window.navbar = navbar;
    window.session = session;
    window.comment = comment;
    window.pagination = pagination;
});