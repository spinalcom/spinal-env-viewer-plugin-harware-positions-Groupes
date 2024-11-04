const {
    SpinalContextApp
  } = require('spinal-env-viewer-context-menu-service');
  import { attributeService } from "spinal-env-viewer-plugin-documentation-service";
  import { SpinalGraphService } from "spinal-env-viewer-graph-service";
  import { SITE_RELATION, BUILDING_RELATION, FLOOR_RELATION, FLOOR_TYPE } from "spinal-env-viewer-context-geographic-service";
  import { NetworkTreeService } from "spinal-env-viewer-plugin-network-tree-service";


  const {
    spinalPanelManagerService,
  } = require("spinal-env-viewer-panel-manager-service");


    export class RemoveNetworkTreeLink extends SpinalContextApp {
      constructor() {
        super('Remove Network Tree Link', 'Spinal CDE description', {
          icon: 'delete',
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
        
            const NetworkGroupID = option.selectedNode.id.get();
            const NetworkTreeGroupPosition = await SpinalGraphService.getChildren(NetworkGroupID, "hasNetworkTreeBimObject");

        if (NetworkTreeGroupPosition.length != 0){

          for (const Position of NetworkTreeGroupPosition) {
            const Children = await SpinalGraphService.getChildren(Position.id.get(), "hasNetworkTreeBimObject");

            if (Children.length === 0) continue;

            for (const bimObject of Children) {
                await SpinalGraphService.removeChild(Position.id.get(), bimObject.id.get(), "hasNetworkTreeBimObject", "PtrLst", false);
            }
            
            await SpinalGraphService.removeChild(NetworkGroupID, Position.id.get(), "hasNetworkTreeBimObject", "PtrLst", false);
        }
        await SpinalGraphService.removeChild(option.context.id.get(), NetworkGroupID, "hasNetworkTreeGroup", "PtrLst", false)

        } else {
          
          await SpinalGraphService.removeChild(option.context.id.get(), NetworkGroupID, "hasNetworkTreeGroup", "PtrLst", false);}

        
       
       
    }
  }