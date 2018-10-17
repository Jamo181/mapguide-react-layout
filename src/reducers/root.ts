import { configReducer} from "./config";
import { toolbarReducer } from "./toolbar";
import { taskPaneReducer } from "./taskpane";
import { lastAction } from "./last-action";
import { modalReducer } from "./modal";
import { initErrorReducer } from "./init-error";
import { mapStateReducer } from "./map-state";
import { viewerReducer } from "./viewer";
import { mouseReducer } from "./mouse";
import { templateReducer } from "./template";
import { pbplReducer } from "./pbpl";

const rootReducer: any = {
    initError: initErrorReducer,
    config: configReducer,
    template: templateReducer,
    mapState: mapStateReducer,
    viewer: viewerReducer,
    toolbar: toolbarReducer,
    taskpane: taskPaneReducer,
    modal: modalReducer,
    mouse: mouseReducer,
    lastaction: lastAction,
    pbpl: pbplReducer
};

export default rootReducer;
