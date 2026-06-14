// Minimal Redux-style store for cart state
const STORAGE_KEY = 'verdantquasar_cart_v1';

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Actions
const ADD_ITEM = 'ADD_ITEM';
const INC_ITEM = 'INC_ITEM';
const DEC_ITEM = 'DEC_ITEM';
const DEL_ITEM = 'DEL_ITEM';

// Reducer
function cartReducer(state = loadState(), action) {
    switch (action.type) {
        case ADD_ITEM: {
            const { id, name, price, img } = action.payload;
            const next = { ...state };
            if (!next[id]) next[id] = { id, name, price, img, quantity: 0 };
            next[id].quantity += 1;
            return next;
        }
        case INC_ITEM: {
            const { id } = action.payload;
            const next = { ...state };
            if (!next[id]) return state;
            next[id] = { ...next[id], quantity: next[id].quantity + 1 };
            return next;
        }
        case DEC_ITEM: {
            const { id } = action.payload;
            const next = { ...state };
            if (!next[id]) return state;
            const qty = next[id].quantity - 1;
            if (qty <= 0) {
                delete next[id];
            } else {
                next[id] = { ...next[id], quantity: qty };
            }
            return next;
        }
        case DEL_ITEM: {
            const { id } = action.payload;
            const next = { ...state };
            delete next[id];
            return next;
        }
        default:
            return state;
    }
}

// Tiny store implementation
function createStore(reducer) {
    let state = reducer(undefined, { type: '@@INIT' });
    const listeners = new Set();
    return {
        dispatch(action) {
            state = reducer(state, action);
            saveState(state);
            listeners.forEach(l => l());
        },
        getState() { return state; },
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
    };
}

// Export globals for simplicity in vanilla setup
window.VQStore = createStore(cartReducer);
window.VQActions = { ADD_ITEM, INC_ITEM, DEC_ITEM, DEL_ITEM };


