import { util } from './util.js';
import { like } from './like.js';
import { theme } from './theme.js';
import { audio } from './audio.js';
import { comment } from './comment.js';
import { progress } from './progress.js';
import { pagination } from './pagination.js';

document.addEventListener('DOMContentLoaded', () => {
    util.init();
    audio.init();
    theme.check();
    comment.init();
    progress.init();
    pagination.init();
    window.AOS.init();

    window.util = util;
    window.like = like;
    window.theme = theme;
    window.audio = audio;
    window.comment = comment;
    window.pagination = pagination;
});
