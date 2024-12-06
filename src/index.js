const SideBarHookName = 'GraphManagerSideBar';
const {
    spinalContextMenuService,
} = require('spinal-env-viewer-context-menu-service');
import {CreatNetworkTreeLink} from "./CreatNetworkTreeLink.js";
import {GenerateFloorBtn} from "./GenerateFloorBtn.js";
import {RemoveNetworkTreeLink} from "./RemoveNetworkTreeLink.js";
const {
    SpinalForgeExtention
  } = require("spinal-env-viewer-panel-manager-service_spinalforgeextention");

import Vue from 'vue';
import panelcreatenetworktreelink from "./panel-create-network-tree-link.vue";
  
spinalContextMenuService.registerApp(
    SideBarHookName,
    new GenerateFloorBtn(), [7]
);

spinalContextMenuService.registerApp(
    SideBarHookName,
    new CreatNetworkTreeLink(), [7]
);

spinalContextMenuService.registerApp(
    SideBarHookName,
    new RemoveNetworkTreeLink(), [7])

SpinalForgeExtention.registerExtention('CreateNetworkTreeLink', SpinalForgeExtention.createExtention({
    name: "CreateNetworkTreeLink",
    // Vue.extend to create a Compoment constructor
    vueMountComponent: Vue.extend(panelcreatenetworktreelink),
    // where to  append the Compoment
    parentContainer: document.body,
  
    panel: {
      title: "Generate Hardware Context",
      classname: "spinal-pannel",
      closeBehaviour: "delete"
    },
    style: {
      left: "405px",
      width: "700px",
      height: '250px'
    }
  }));
