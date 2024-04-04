export const navbar = (() => {

    const buttonNavHome = (btn) => {
        bootstrap.Tab.getOrCreateInstance(document.getElementById('button-home')).show();
        btn.classList.add('active');
        document.getElementById('button-mobile-setting').classList.remove('active');
    };

    const buttonNavSetting = (btn) => {
        bootstrap.Tab.getOrCreateInstance(document.getElementById('button-setting')).show();
        btn.classList.add('active');
        document.getElementById('button-mobile-home').classList.remove('active');
    };

    return {
        buttonNavHome,
        buttonNavSetting
    };
})();