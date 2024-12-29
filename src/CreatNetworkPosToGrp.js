const {
  SpinalContextApp
} = require('spinal-env-viewer-context-menu-service');
import { attributeService } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { SITE_RELATION, BUILDING_RELATION, FLOOR_RELATION, FLOOR_TYPE } from "spinal-env-viewer-context-geographic-service";
import { NetworkTreeService } from "spinal-env-viewer-plugin-network-tree-service";
import { Positions_BIM_Context, Gatway_BIM_Context, OPCUA_Context, Position_To_Lum_Context } from "../.config"
import { hardwarecontexteGeneration } from "./mainfunction.js";
const {
  spinalPanelManagerService,
} = require("spinal-env-viewer-panel-manager-service");

export class CreatNetworkPosToGrp extends SpinalContextApp {
  constructor() {
    super('Link position to Groupe', 'Spinal CDE description', {
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
    if (attributes["Hardware Context"]?.["Hardware Context Type"] !== "Position_Groupe D'ALI")
      return -1;
    return true;
  }


  async action(option) {
   
    const PosContext = Positions_BIM_Context.positionContextName;
    const PosCategory = Positions_BIM_Context.positionCategoryName;
    const PosGroup = Positions_BIM_Context.positionGroupName;

    const GatContext = Gatway_BIM_Context.GatewayContextName;
    const GatCategory = Gatway_BIM_Context.GatewayCategoryName;
    const GatGroup = Gatway_BIM_Context.GatewayGroupName;

    const OPCUAContext = OPCUA_Context.ContextNetworkName;
    const Organ = OPCUA_Context.OrganNetworkName;
    const NetworkName = OPCUA_Context.NetworkName;

    const LumContext = Position_To_Lum_Context.lum_contextName;
    
    await hardwarecontexteGeneration(PosContext, PosCategory, PosGroup, 
                                     GatContext, GatCategory, GatGroup, 
                                     OPCUAContext, Organ, NetworkName, 
                                     LumContext,option);

   
  }
}