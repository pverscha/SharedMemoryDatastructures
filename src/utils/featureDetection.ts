
export const SUPPORTS_SAB_VIEW_DECODE = (() => {
    try {
        if (typeof SharedArrayBuffer === 'undefined') return false;
        // Create a small SharedArrayBuffer and try to decode a view of it
        const sab = new SharedArrayBuffer(1);
        const view = new Uint8Array(sab);
        new TextDecoder().decode(view);
        return true;
    } catch (e) {
        return false;
    }
})();
