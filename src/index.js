const SideBarHookName = 'GraphManagerSideBar';
const {
    spinalContextMenuService,
} = require('spinal-env-viewer-context-menu-service');
import {CreatNetworkTreeLink} from "./CreatNetworkTreeLink.js";
import {GenerateFloorBtn} from "./GenerateFloorBtn.js";


spinalContextMenuService.registerApp(
    SideBarHookName,
    new GenerateFloorBtn(), [7]
);

spinalContextMenuService.registerApp(
    SideBarHookName,
    new CreatNetworkTreeLink(), [7]
);