const SideBarHookName = 'GraphManagerSideBar';
const {
    spinalContextMenuService,
} = require('spinal-env-viewer-context-menu-service');
import {CreatNetworkPosToGrp} from "./CreatNetworkPosToGrp.js";
import {GenerateFloorBtnPosToGrp} from "./GenerateFloorBtnPosToGrp.js";

const {
    SpinalForgeExtention
  } = require("spinal-env-viewer-panel-manager-service_spinalforgeextention");


  
spinalContextMenuService.registerApp(
    SideBarHookName,
    new GenerateFloorBtnPosToGrp(), [7]
);

spinalContextMenuService.registerApp(
    SideBarHookName,
    new CreatNetworkPosToGrp(), [7]
);


