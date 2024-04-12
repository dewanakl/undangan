export const storage = (table) => {

    if (!localStorage.getItem(table)) {
        localStorage.setItem(table, JSON.stringify({}));
    }

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

    return {
        get,
        set,
        unset,
        has,
    };
};