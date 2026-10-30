import './styles/base.css';
import './styles/header.css';
import './styles/forms.css';
import './styles/home.css';
import { createStore } from './core/store';
import { startShell } from './features/shell';
function storage() {
    try {
        return window.localStorage;
    }
    catch {
        return undefined;
    }
}
startShell(createStore(storage()));
