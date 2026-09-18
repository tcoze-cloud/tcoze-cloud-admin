import type { App, Directive } from 'vue'
import { auth, auths, authsAll } from './modules/auth'
import copy from './modules/copy'
import debounce from './modules/debounce'
import longPress from './modules/long-press.ts'
import role from './modules/role'
import throttle from './modules/throttle'
import { time, timeYMD, timeYMDHM } from './modules/time'
import waterMarker from './modules/water-marker.ts'

const directivesList: { [key: string]: Directive } = {
    auth,
    auths,
    authsAll,
    copy,
    debounce,
    longPress,
    role,
    throttle,
    time,
    timeYMD,
    timeYMDHM,
    waterMarker
}

const directives = {
    install: function (app: App<Element>) {
        Object.keys(directivesList).forEach((key) => {
            app.directive(key, directivesList[key])
        })
    }
}

export default directives
