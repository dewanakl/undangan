export const storage = (table) => {

    const get = (key = null) => {
        const data = JSON.parse(localStorage.getItem(table));
        return key ? data[String(key)] : data;
    };

    const set = (key, value) => {
        let storage = get();
        storage[String(key)] = value;

        localStorage.removeItem(table);
        localStorage.setItem(table, JSON.stringify(storage));
    };

    const unset = (key) => {
        let storage = get();
        delete storage[String(key)];

        localStorage.removeItem(table);
        localStorage.setItem(table, JSON.stringify(storage));
    };

    const has = (key) => Object.keys(get()).includes(String(key));

    const clear = () => localStorage.setItem(table, JSON.stringify({}));

    if (!localStorage.getItem(table)) {
        clear();
    }

    return {
        get,
        set,
        unset,
        has,
        clear,
    };
};