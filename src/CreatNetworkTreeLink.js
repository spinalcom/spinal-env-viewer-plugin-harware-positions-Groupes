const {
  SpinalContextApp
} = require('spinal-env-viewer-context-menu-service');
import { attributeService } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { SITE_RELATION, BUILDING_RELATION, FLOOR_RELATION, FLOOR_TYPE } from "spinal-env-viewer-context-geographic-service";
import { NetworkTreeService } from "spinal-env-viewer-plugin-network-tree-service";
import {
  getPositions,
  // getFloorPositions
} from './func.js';
import { getFloorPositions } from "./test";

export class CreatNetworkTreeLink extends SpinalContextApp {
  constructor() {
    super('Link position to luminaire', 'Spinal CDE description', {
      icon: 'lightbulb',
      icon_type: 'in',
      backgroundColor: '#356BAB',
      fontColor: '#FFFFFF',
    });
  }

  async isShown(option) {
    if (option.selectedNode.type.get() !== "network")
      return -1;
    const context = option.context;
    const contextNode = SpinalGraphService.getRealNode(context.id.get());
    const attributes = await attributeService.getAttrBySchema(contextNode, {
      "Hardware Context": ["Hardware Context Type"]
    });
    if (attributes["Hardware Context"]?.["Hardware Context Type"] !== "Position_Luminaire")
      return -1;
    return true;
  }


  async action(option) {
    const ContextName = "Gestion des équipements";
    const CategoryName = "Typologie";
    const GroupName = "Positions de travail";
    const positionsList = await getPositions(ContextName, CategoryName, GroupName);
    const positions = await getFloorPositions(positionsList, option.selectedNode.name.get());

    console.log(positions);

    // const selectedNode = SpinalGraphService.getRealNode(option.selectedNode.id.get());
    // const contextNode = SpinalGraphService.getRealNode(option.context.id.get());
    // const positionNode = await selectedNode.getChildrenInContext(contextNode);

    // const PositionNames = positionNode.map(node => node.name.get());

    // for (const pos of positions) {
    //   if ((!PositionNames.includes(pos.name.get())))
    //     await SpinalGraphService.addChildInContext(option.selectedNode.id.get(), pos.id.get(), option.context.id.get(), "hasNetworkTreeBimObject", "PtrLst");

    // }
  }
}