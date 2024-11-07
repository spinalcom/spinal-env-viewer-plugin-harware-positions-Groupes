const {
    SpinalContextApp
  } = require('spinal-env-viewer-context-menu-service');
  import { attributeService } from "spinal-env-viewer-plugin-documentation-service";
  import { SpinalGraphService } from "spinal-env-viewer-graph-service";
  import{removeRelationIfExist}from"./test.ts"

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

          // Récupère les positions
          const Children = await SpinalGraphService.getChildren(Position.id.get(), "hasNetworkTreeBimObject");

          if (Children.length === 0) {
            // Si pas d'enfants, supprime la relation directement
            await removeRelationIfExist(node, "hasNetworkTreeBimObject", "PtrLst", Position.id.get());
          } else {
            // Supprime chaque enfant de la position
            for (const bimObject of Children) {
              await SpinalGraphService.removeChild(Position.id.get(), bimObject.id.get(), "hasNetworkTreeBimObject", "PtrLst", false);
            }
            // supprime la relation position -> equipement
            await removeRelationIfExist(node, "hasNetworkTreeBimObject", "PtrLst", Position.id.get());
          }

          // Supprime position
          await SpinalGraphService.removeChild(NetworkGroupID, Position.id.get(), "hasNetworkTreeBimObject", "PtrLst", false);
        }
      }

      // Supprime les relations de l'étage vers positions
      const networkNode = SpinalGraphService.getRealNode(NetworkGroupID);
      await removeRelationIfExist(networkNode, "hasNetworkTreeBimObject", "PtrLst", NetworkGroupID);

    } catch (e) {
      console.error("Error in action function:", e);
    }
  }
}
