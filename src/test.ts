
import { SpinalContext, SpinalGraphService, SpinalNode, SpinalNodeRef } from "spinal-env-viewer-graph-service";
import { attributeService } from "spinal-env-viewer-plugin-documentation-service";
import { serviceDocumentation} from"spinal-env-viewer-plugin-documentation-service";
import { SpinalAttribute } from "spinal-models-documentation";
import { NetworkTreeService } from "spinal-env-viewer-plugin-network-tree-service";



export async function getequipments(ContextName : string, CategoryName: string, GroupName:string): Promise<SpinalNodeRef[]> {
  try {
      const Context = SpinalGraphService.getContext(ContextName);
      if (!Context) {
          console.log("Gateways Context not found");
          return [];   
      }
      

      const ContextID = Context.info.id.get();
      const category = (await SpinalGraphService.getChildren(ContextID, ["hasCategory"])).find(child => child.name.get() === CategoryName);

      if (!category) {
          console.log("Category ",CategoryName," not found");
          return [];
      }

      const categoryID = category.id.get();
      const Groups = await SpinalGraphService.getChildren(categoryID, ["hasGroup"]);
      if (Groups.length === 0) {
          console.log("No groups found under the category");
          return [];
      }

      const GatewayGroup = Groups.find(group => group.name.get() === GroupName);
      if (!GatewayGroup) {
          console.log("Group ", GroupName ," not found");
          return [];
      }

      //console.log("Group 'Luminaire' found:", LumGroup);

      const Gateways = await SpinalGraphService.getChildren(GatewayGroup.id.get(), ["groupHasBIMObject"]);
      if (Gateways.length === 0) {
          console.log("No equipmentss found in the group");
          return [];
      }

      //console.log("Luminaires found:", Lum);
      return Gateways;

  } catch (error) {
      console.error("Error in getequipments:", error);
      return [];
  }
}


export async function getPositions(ContextName:string, CategoryName:string, GroupName:string): Promise<SpinalNodeRef[]> {
  try {
      const Context = SpinalGraphService.getContext(ContextName);
      if (!Context) {
          console.log("Context not found");
          return [];
      }

      const ContextID = Context.info.id.get();
      const category = (await SpinalGraphService.getChildren(ContextID, ["hasCategory"])).find(child => child.name.get() === CategoryName);
      if (!category) {
          console.log("Category 'Typologie' not found");
          return [];
      }

      const categoryID = category.id.get();
      const Groups = await SpinalGraphService.getChildren(categoryID, ["hasGroup"]);
      if (Groups.length === 0) {
          console.log("No groups found under the category");
          return[];
      }

      const PosGroup = Groups.find(group => group.name.get() === GroupName);
      if (!PosGroup) {
          console.log("Group 'Positions de travail' not found");
          return [];
      }

      //console.log("Group 'Positions de travail' found:", PosGroup);

      const Positions = await SpinalGraphService.getChildren(PosGroup.id.get(), ["groupHasBIMObject"]);
      if (Positions.length === 0) {
          console.log("No positions found in the group");
          return[];
      }

      //console.log("Positions found:", Positions);
      return Positions;

  } catch (error) {
      console.error("Error in getPositions:", error);
      return[];
  }
}


type NodeEquipement = SpinalNodeRef;
type Attribute = SpinalAttribute;

type EquipementInfo = {
  Equipement: NodeEquipement;
  Coordinates: Attribute;
};

export async function getFloorEquipments(
  listOfGateways: SpinalNodeRef[],
  floorName: string
): Promise<EquipementInfo[]> {
  const EquipmentsList: EquipementInfo[] = [];
  console.log("before loop list des luminaires")
  for (const equ of listOfGateways) {
    const equiInfo: EquipementInfo = {
      Equipement: equ,
      Coordinates: null  
    };
    const parents: SpinalNodeRef[] = await SpinalGraphService.getParents(equ.id.get(), ["hasBimObject"]);
    const roomParent = parents.find(elt => elt.type.get() === "geographicRoom");
    console.log("room found",roomParent)
    if (roomParent) {
      const floorParents: SpinalNodeRef[] = await SpinalGraphService.getParents(roomParent.id.get(), ["hasGeographicRoom"]);
      const floorParent = floorParents.find(elt => elt.type.get() === "geographicFloor" && elt.name.get() ===floorName);
      console.log("floor found",floorParent)
      console.log("floorName",floorName)
      if (floorParent) {
        console.log("second floor verification ")
        const RealNode = await SpinalGraphService.getRealNode(equ.id.get());
        const attributes = await serviceDocumentation.getAttributesByCategory(RealNode, "Spatial", "XYZ center");

        // Vérifie que 'attributes' contient au moins un élément
        equiInfo.Coordinates = attributes[0] || null; 

        EquipmentsList.push(equiInfo);
        console.log("equipement pushed")
      }
    }
  }

  return EquipmentsList;
}

type NodePosition = SpinalNodeRef;
type PosAttribute = SpinalAttribute;

type PositionInfo = {
  Position: NodePosition;
  Coordinates: PosAttribute;
};
export async function getFloorPos(
  listOfPositions: SpinalNodeRef[],
  floorName: string
): Promise<PositionInfo[]> {
  const POSList: PositionInfo[] = [];

  for (const pos of listOfPositions) {
    const posInfo: PositionInfo = {
      Position: pos,
      Coordinates: null  
    };
    const parents: SpinalNodeRef[] = await SpinalGraphService.getParents(pos.id.get(), ["hasBimObject"]);
    const roomParent = parents.find(elt => elt.type.get() === "geographicRoom");

    if (roomParent) {
      const floorParents: SpinalNodeRef[] = await SpinalGraphService.getParents(roomParent.id.get(), ["hasGeographicRoom"]);
      const floorParent = floorParents.find(elt => elt.type.get() === "geographicFloor" && elt.name.get()=== floorName);

      if (floorParent) {
        const RealNode = await SpinalGraphService.getRealNode(pos.id.get());
        const attributes = await serviceDocumentation.getAttributesByCategory(RealNode, "Spatial", "XYZ center");

        // Vérifie que 'attributes' contient au moins un élément
        posInfo.Coordinates = attributes[0] || null; 

        POSList.push(posInfo);
      }
    }
  }

  return POSList;
}



export function findEquForPosition(
  PosInFloor: PositionInfo,
  ListOfequipInFloor: EquipementInfo[],
  DistanceConst: number
): SpinalNodeRef[] | undefined {
  
  const equipForPosition: SpinalNodeRef[] = [];

  if (PosInFloor.Coordinates && PosInFloor.Coordinates.value) {
    const posCoord = PosInFloor.Coordinates.value.get();
    const [posXcoor, posYcoor, posZcoor] = String(posCoord).split(";").map(Number);

    for (const equ of ListOfequipInFloor) {
      if (equ.Coordinates && equ.Coordinates.value) {
        const equipCoord = equ.Coordinates.value.get();
        const [equipXcoor, equipYcoor, equipZcoor] = String(equipCoord).split(";").map(Number);

        const distance = (Math.sqrt(
          Math.pow(posXcoor - equipXcoor, 2) +
          Math.pow(posYcoor - equipYcoor, 2) 
        ))*0.3048;

        
        
        if (distance < DistanceConst) {
          equipForPosition.push(equ.Equipement);
        }
      } else {
        console.log("Attribute not found for equipment", equ.Equipement.name?.get());
      }
    }
  } else {
    console.log("Attribute not found for position", PosInFloor.Position?.name?.get());
  }

  // Retourne la liste si des équipements sont trouvés, sinon undefined
  return equipForPosition.length > 0 ? equipForPosition : undefined;
}

export async function addPositionToNetwork(pos:SpinalNodeRef, option: { selectedNode: SpinalNodeRef, context: SpinalNodeRef }) {
  
 let existedPos : SpinalNodeRef[]=[];
 
 existedPos = await SpinalGraphService.getChildren(option.selectedNode.id.get(), ["hasNetworkTreeBimObject"]);
 let  PositionNames : string[] = [] ;

 PositionNames = existedPos.map(elt => elt.name.get());
 if(!PositionNames.includes(pos.name.get())){

  console.log("adding position to network")
    await SpinalGraphService.addChildInContext(option.selectedNode.id.get(), pos.id.get(),
      option.context.id.get(), "hasNetworkTreeBimObject", "PtrLst");   
 }
 else {
   console.log("Position already exist")
 }


}
export async function addGrpToPositon(
  EquipmentsForPosition: SpinalNodeRef[],
  pos: SpinalNodeRef,
  option: { selectedNode: SpinalNodeRef; context: SpinalNodeRef }
) {
  for (const equ of EquipmentsForPosition) {
    try {
      const posId = pos.id?.get();
      const equId = equ.id?.get();
      const contextId = option.context.id?.get();

      if (posId && equId && contextId) {
        console.log("test")
        await SpinalGraphService.addChildInContext(
          posId,
          equId,
          contextId,
          "hasNetworkTreeBimObject",
          "PtrLst"
        );
      } else {
        console.warn("Missing ID for position or equipment:", {
          posId,
          equId,
          contextId,
        });
      }
    } catch (error) {
      console.error(
        "Failed to add equipment",
        equ.name?.get(),
        "to position",
        pos.name?.get(),
        error
      );
    }
  }
}


export async function removeRelationIfExist(node :SpinalNode, relationName:string, relationType:string, nodeId:string) {
  if (node.hasRelation(relationName, relationType)) {
    try {
      await node.removeRelation(relationName, relationType);
      
    } catch (e) {
      console.error(e);
    }
  }
}

export async function FindBimGateways(ContextName : string, CategoryName: string, GroupName:string): Promise<SpinalNodeRef[]> {
  try {
      const Context = SpinalGraphService.getContext(ContextName);
      if (!Context) {
          console.log("Gateways Context not found");
          return [];   
      }
      

      const ContextID = Context.info.id.get();
      const category = (await SpinalGraphService.getChildren(ContextID, ["hasCategory"])).find(child => child.name.get() === CategoryName);

      if (!category) {
          console.log("Category ",CategoryName," not found");
          return [];
      }

      const categoryID = category.id.get();
      const Groups = await SpinalGraphService.getChildren(categoryID, ["hasGroup"]);
      if (Groups.length === 0) {
          console.log("No groups found under the category");
          return [];
      }

      const GatewayGroup = Groups.find(group => group.name.get() === GroupName);
      if (!GatewayGroup) {
          console.log("Group ", GroupName ," not found");
          return [];
      }

      

      const Gateways = await SpinalGraphService.getChildren(GatewayGroup.id.get(), ["groupHasBIMObject"]);
      if (Gateways.length === 0) {
          console.log("No equipments found in the group");
          return [];
      }

      
      return Gateways;

  } catch (error) {
      console.error("Error in FindBimGateways:", error);
      return [];
  }
}


export async function FindBMSGateways(ContextOPCUA : string, OrganOPCUA: string, NetworkName:string): Promise<SpinalNodeRef[]> {
  try {
      const Context = SpinalGraphService.getContext(ContextOPCUA);
      
      if (!Context) {
          console.log("OPCUA Context not found");
          return [];   
      }
      console.log("context found ",ContextOPCUA)

      const ContextID = Context.info.id.get();
      const organ = (await SpinalGraphService.getChildren(ContextID, ["hasBmsNetworkOrgan"])).find(child => child.name.get() === OrganOPCUA);
      console.log("organ found ",organ)
      if (!organ) {
          console.log("Organ OPCUA ",OrganOPCUA," not found");
          return [];
      }

      const organID = organ.id.get();
      const hasBmsNetwork = await SpinalGraphService.getChildren(organID, ["hasBmsNetwork"]);
      if (hasBmsNetwork.length === 0) {
          console.log("No Network found under the organ");
          return [];
      }

      const Network = hasBmsNetwork.find(group => group.name.get() === NetworkName);
      if (!Network) {
          console.log("Network", NetworkName ," not found");
          return [];
      }

      

      const Gateways = await SpinalGraphService.getChildren(Network.id.get(), ["hasBmsDevice"]);
      if (Gateways.length === 0) {
          console.log("No Gateway found in the bmsNetwork");
          return [];
      }

      
      return Gateways;

  } catch (error) {
      console.error("Error in FindBMSGateways:", error);
      return [];
  }

}
  


export async function matchBIMandBMSGateways(
  bimList: SpinalNodeRef[],
  bmsList: SpinalNodeRef[],
  floorname: string
): Promise<SpinalNodeRef[]> {
  const matchingGateways: SpinalNodeRef[] = [];
  const filtredBimByFloor: SpinalNodeRef[] = [];

  if (bimList.length === 0 || bmsList.length === 0) {
    return matchingGateways; // Return empty if either list is empty
  }

  // Filter BIM objects
  for (const bim of bimList) {
    try {
      const parents: SpinalNodeRef[] = await SpinalGraphService.getParents(bim.id.get(), ["hasBimObject"]);
      if (parents.length === 0) continue;

      const room: SpinalNodeRef = parents.find(elt => elt.type.get() === "geographicRoom");
      if (!room) continue;

      const floorParents: SpinalNodeRef[] = await SpinalGraphService.getParents(room.id.get(), ["hasGeographicRoom"]);
      const floorParent: SpinalNodeRef = floorParents.find(
        elt => elt.type.get() === "geographicFloor" && elt.name.get() === floorname
      );

      if (floorParent) {
        filtredBimByFloor.push(bim);
      }
    } catch (error) {
      console.error("Error while filtering BIM objects by floor:", error);
      continue;
    }
  }

  if (filtredBimByFloor.length === 0) {
    return matchingGateways; // No BIM objects match the specified floor
  }
  
  console.log("BIM objects filtered by floor:", filtredBimByFloor);
  // Match filtered BIM objects with BMS objects
  for (const bms of bmsList) {
    try {
      const bmsAttribute = bms.name.get(); // Attribute from BMS object

      for (const bim of filtredBimByFloor) {
        const realNode = await SpinalGraphService.getRealNode(bim.id.get());
        const bimAttribute = await serviceDocumentation.findOneAttributeInCategory(
          realNode,
          "OPC Attributes",
          "LO_TableauELE"
        );

        if (bimAttribute!=-1) {
          console.log("No attributes found for BIM object:", bim.name.get());

          
           const bimValue = bimAttribute.value.get();
            if (bmsAttribute === bimValue) {
              matchingGateways.push(bms);
        }
          
        }else {
          console.log("No attributes found for BIM object:", bim.name.get());
          continue;}

      }
    } catch (error) {
      console.error("Error while matching BIM and BMS objects:", error);
      continue;
    }
  }

  return matchingGateways;
}

export function gethardwarecontext(contextname:string):SpinalContext | undefined {

  
  const context = SpinalGraphService.getContext(contextname);
  if (!context) {
      console.log("Context not found");
      return undefined;
  }
  return context;
}

export async function createNodeandAddInContext( nodeName:string,ParentID:string,contextID:string,nodeType:string,relationName:string,relationType:string): Promise<SpinalNode<any>>{
 let node = SpinalGraphService.createNode({nodeName, type: nodeType})
 return SpinalGraphService.addChildInContext(ParentID, node, contextID, relationName, relationType)

}