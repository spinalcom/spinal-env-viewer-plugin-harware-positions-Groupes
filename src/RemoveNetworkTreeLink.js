const {
    SpinalContextApp
  } = require('spinal-env-viewer-context-menu-service');
  import { attributeService } from "spinal-env-viewer-plugin-documentation-service";
  import { SpinalGraphService } from "spinal-env-viewer-graph-service";
  
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
        
        try {
          const NetworkGroupID = option.selectedNode.id.get();
          const NetworkTreeGroupPosition = await SpinalGraphService.getChildren(NetworkGroupID, "hasNetworkTreeBimObject");
      
          if (NetworkTreeGroupPosition.length > 0) {
            for (const Position of NetworkTreeGroupPosition) {
            
              let node = SpinalGraphService.getRealNode(Position.id.get());

              const Children = await SpinalGraphService.getChildren(Position.id.get(), "hasNetworkTreeBimObject");
      
              if (Children.length === 0 && node.hasRelation("hasNetworkTreeBimObject", "PtrLst")) {
                try {
                  node.removeRelation("hasNetworkTreeBimObject", "PtrLst");
                } catch (e) {
                  console.error("Error removing relation hasNetworkTreeBimObject from node with ID:", Position.id.get(), e);
                }
              } else if(Children.length > 0) {
                for (const bimObject of Children) {
                  await SpinalGraphService.removeChild(Position.id.get(), bimObject.id.get(), "hasNetworkTreeBimObject", "PtrLst", false);
                }
                try {
                  node.removeRelation("hasNetworkTreeBimObject", "PtrLst");
                } catch (e) {
                  console.error("Error removing relation hasNetworkTreeBimObject", e);
                }
              }
      
              await SpinalGraphService.removeChild(NetworkGroupID, Position.id.get(), "hasNetworkTreeBimObject", "PtrLst", false);
            }
          }
          const networkNode = SpinalGraphService.getRealNode(NetworkGroupID);
          try {
            networkNode.removeRelation("hasNetworkTreeBimObject", "PtrLst");
          } catch (e) {
            console.error("Error removing relation hasNetworkTreeBimObject from node with ID:", networkNode.id.get(), e);
          }
          //await SpinalGraphService.removeChild(option.context.id.get(), NetworkGroupID, "hasNetworkTreeGroup", "PtrLst", false);
        } catch (e) {
          console.error("Error in action function:", e);
        }
  }
}