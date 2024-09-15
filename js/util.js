import { AOS } from "./aos.js";
import { audio } from "./audio.js";
import { theme } from "./theme.js";
import { comment } from "./comment.js";
import { storage } from "./storage.js";
import { confetti } from "./confetti.js";
import { bootstrap } from "./bootstrap.js";
import { request, HTTP_GET } from "./request.js";

export const util = (() => {
    const opacity = (id, speed = 0.01) => {
        const element = document.getElementById(id);
        let op = parseInt(element.style.opacity);

        let clear = null;
        clear = setInterval(() => {
            if (op > 0) {
                element.style.opacity = op.toString();
                op -= speed;
            } else {
                clearInterval(clear);
                clear = null;
                element.remove();
            }
        }, 10);
    };

    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const disableButton = (button, message = "Loading..") => {
        button.disabled = true;
        let tmp = button.innerHTML;
        button.innerHTML = message;

        const restore = () => {
            button.innerHTML = tmp;
            button.disabled = false;
        };

        return {
            restore,
        };
    };

    const animate = (svg, timeout, classes) => {
        setTimeout(() => {
            svg.classList.add(classes);
        }, timeout);
    };

    const guest = () => {
        const name = new URLSearchParams(window.location.search).get("to");
        const guest = document.getElementById("guest-name");

        if (!name) {
            guest.remove();
            return;
        }

        const div = document.createElement("div");
        div.classList.add("m-2");
        div.innerHTML = `<p class="mt-0 mb-1 mx-0 p-0 text-light">${guest.getAttribute(
            "data-message"
        )}</p><h2 class="text-light">${escapeHtml(name)}</h2>`;

        document.getElementById("form-name").value = name;
        guest.appendChild(div);
    };

    const modal = (img) => {
        document.getElementById("show-modal-image").src = img.src;
        new bootstrap.Modal("#modal-image").show();
    };

    const countDownDate = () => {
        const until = document
            .getElementById("count-down")
            .getAttribute("data-time")
            .replace(" ", "T");
        const count = new Date(until).getTime();

        setInterval(() => {
            const distance = Math.abs(count - new Date().getTime());

            document.getElementById("day").innerText = Math.floor(
                distance / (1000 * 60 * 60 * 24)
            );
            document.getElementById("hour").innerText = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            document.getElementById("minute").innerText = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60)
            );
            document.getElementById("second").innerText = Math.floor(
                (distance % (1000 * 60)) / 1000
            );
        }, 1000);
    };

    const copy = async (button, message, timeout = 1500) => {
        try {
            await navigator.clipboard.writeText(
                button.getAttribute("data-copy")
            );
        } catch {
            alert("Failed to copy");
            return;
        }

        button.disabled = true;
        let tmp = button.innerText;
        button.innerText = message;

        let clear = null;
        clear = setTimeout(() => {
            button.disabled = false;
            button.innerText = tmp;

            clearTimeout(clear);
            clear = null;
            return;
        }, timeout);
    };

    const animation = () => {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const colors = ["#FFC0CB", "#FF1493", "#C71585"];

        const randomInRange = (min, max) => {
            return Math.random() * (max - min) + min;
        };

        const heart = confetti.shapeFromPath({
            path: "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z",
            matrix: [
                0.03333333333333333, 0, 0, 0.03333333333333333,
                -5.566666666666666, -5.533333333333333,
            ],
        });

        (function frame() {
            const timeLeft = animationEnd - Date.now();

            colors.forEach((color) => {
                confetti({
                    particleCount: 1,
                    startVelocity: 0,
                    ticks: Math.max(50, 75 * (timeLeft / duration)),
                    origin: {
                        x: Math.random(),
                        y: Math.abs(Math.random() - timeLeft / duration),
                    },
                    zIndex: 1057,
                    colors: [color],
                    shapes: [heart],
                    drift: randomInRange(-0.5, 0.5),
                    gravity: randomInRange(0.5, 1),
                    scalar: randomInRange(0.5, 1),
                });
            });

            if (timeLeft > 0) {
                requestAnimationFrame(frame);
            }
        })();
    };

    const storeConfig = async (token) => {
        storage("session").set("token", token);

        const config = storage("config");
        return await request(HTTP_GET, "/api/config")
            .token(token)
            .then((res) => {
                for (let [key, value] of Object.entries(res.data)) {
                    config.set(key, value);
                }

                return res.code;
            });
    };

    const open = async (button) => {
        button.disabled = true;
        confetti({
            origin: { y: 1 },
            zIndex: 1057,
        });

        document.querySelector("body").style.overflowY = "scroll";
        if (storage("information").get("info")) {
            document.getElementById("information")?.remove();
        }

        const token = document.querySelector("body").getAttribute("data-key");
        if (!token || token.length === 0) {
            document.getElementById("rsvp")?.remove();
            document
                .querySelector('a.nav-link[href="#rsvp"]')
                ?.closest("li.nav-item")
                ?.remove();
        }

        AOS.init();

        countDownDate();
        opacity("loading", 0.025);

        //TODO: Revert to play audio
        audio.showButton();

        document.body.style.overflowY = "scroll";
        document.body.scrollIntoView({ behavior: "instant" });

        if (!token || token.length === 0) {
            return;
        }

        const status = await storeConfig(token);
        if (status === 200) {
            animation();
            await comment.comment();
        }
    };

    const scrollToRsvp = () => {
        const element = document.getElementById("rsvp");
        element.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
        });
    };

    const close = () => {
        storage("information").set("info", true);
    };

    const extractUUIDs = (data) => {
        let uuids = [];

        const traverseComments = (comments) => {
            comments.forEach((comment) => {
                uuids.push(comment.uuid);
                if (comment.comments && comment.comments.length > 0) {
                    traverseComments(comment.comments);
                }
            });
        };

        data.forEach((item) => {
            uuids.push(item.uuid);
            if (item.comments && item.comments.length > 0) {
                traverseComments(item.comments);
            }
        });

        return uuids;
    };

    const name = () => {
        const name = new URLSearchParams(window.location.search).get("to");
        const guest = document.getElementById("guest-name");

        console.log("nama undangan: " + name.toString);

        if (!name || !guest) {
            guest.remove();
        } else {
            const div = document.createElement("div");
            div.classList.add("m-2");
            div.innerHTML = `<p class="mt-0 mb-1 mx-0 p-0">${guest.getAttribute(
                "data-message"
            )}</p><h2>${util.escapeHtml(name)}</h2>`;
            guest.appendChild(div);
        }

        const form = document.getElementById("form-name");
        if (form) {
            form.value = name;
        }
    };

    return {
        open,
        copy,
        scrollToRsvp,
        close,
        modal,
        opacity,
        animate,
        animation,
        escapeHtml,
        extractUUIDs,
        countDownDate,
        disableButton,
        name,
    };
})();
