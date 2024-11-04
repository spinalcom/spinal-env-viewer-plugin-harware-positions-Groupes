
import { SpinalGraphService, SpinalNode, SpinalNodeRef } from "spinal-env-viewer-graph-service";
import { attributeService } from "spinal-env-viewer-plugin-documentation-service";
import { serviceDocumentation} from"spinal-env-viewer-plugin-documentation-service";
import { SpinalAttribute } from "spinal-models-documentation";
import { NetworkTreeService } from "spinal-env-viewer-plugin-network-tree-service";

/*type RoomNodeRef = SpinalNodeRef
type PosTravailNodeRef = SpinalNodeRef
type LumNodeRef = SpinalNodeRef
type RoomInfo = {
  postiontravails: PosTravailNodeRef[];
  luminaires: LumNodeRef[]
}
type IRoomPosition = Map<RoomNodeRef, RoomInfo>


export async function getFloorPositions(ListOfPositions: SpinalNodeRef[], FloorName: string)
  : Promise<IRoomPosition> {
  const PositionInFloor = new Map<RoomNodeRef, RoomInfo>();
  // const PositionInFloor = [];

  for (let pos of ListOfPositions) {
    const parents: RoomNodeRef[] = await SpinalGraphService.getParents(pos.id.get(), ["hasBimObject"]);
    const roomParent = parents.find(elt => elt.type.get() === "geographicRoom");

    if (roomParent) {

      const floorParents: SpinalNodeRef[] = await SpinalGraphService.getParents(roomParent.id.get(), ["hasGeographicRoom"]);
      const floorParent = floorParents.find(elt => elt.type.get() === "geographicFloor");


      if (floorParent && floorParent.name.get() === FloorName) {
        let roomInfo = PositionInFloor.get(roomParent);
        if (!roomInfo) {
          roomInfo = { postiontravails: [], luminaires: [] };
          PositionInFloor.set(roomParent, roomInfo);
        }
        roomInfo.postiontravails.push(pos);
        // PositionInFloor.set(roomParent, pos); // Add the position to the result if it belongs to the specified floor
      }
    }
  }
  
  return PositionInFloor; // Return the list of positions in the specified floor

}
*/


export async function getequipments(ContextName : string, CategoryName: string, GroupName:string): Promise<SpinalNodeRef[]> {
  try {
      const Context = SpinalGraphService.getContext(ContextName);
      if (!Context) {
          console.log("Equipements Context not found");
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

      const equipmentsGroup = Groups.find(group => group.name.get() === GroupName);
      if (!equipmentsGroup) {
          console.log("Group ", GroupName ," not found");
          return [];
      }

      //console.log("Group 'Luminaire' found:", LumGroup);

      const equipements = await SpinalGraphService.getChildren(equipmentsGroup.id.get(), ["groupHasBIMObject"]);
      if (equipements.length === 0) {
          console.log("No equipmentss found in the group");
          return [];
      }

      //console.log("Luminaires found:", Lum);
      return equipements;

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
/*
type NodeLuminaire = SpinalNodeRef;
type Attribute = SpinalAttribute;
type LumInfo = {
  Luminaire: NodeLuminaire;
  Coordinates: Attribute[];
};

export async function getFloorLuminaires(
  listOfLuminaires: SpinalNodeRef[],
  floorName: string
): Promise<LumInfo[]> {
  const LumList: LumInfo[] = [];

        for (const Lum of listOfLuminaires) {
          const lumInfo: LumInfo = {
            Luminaire: Lum,
            Coordinates: [] 
          };
          
          const parents: SpinalNodeRef[] = await SpinalGraphService.getParents(Lum.id.get(), ["hasBimObject"]);
          const roomParent = parents.find(elt => elt.type.get() === "geographicRoom");

          if (roomParent) {
            const floorParents: SpinalNodeRef[] = await SpinalGraphService.getParents(roomParent.id.get(), ["hasGeographicRoom"]);
            const floorParent = floorParents.find(elt => elt.type.get() === "geographicFloor");

            if (floorParent && floorParent.name.get() === floorName) {
              const RealNode = await SpinalGraphService.getRealNode(Lum.id.get());
              lumInfo.Coordinates = await serviceDocumentation.getAttributesByCategory(RealNode, "Spatial", "XYZ center");
              
              LumList.push(lumInfo);
            }
          }
        }

  return LumList;
}*/

type NodeEquipement = SpinalNodeRef;
type Attribute = SpinalAttribute;

type EquipementInfo = {
  Equipement: NodeEquipement;
  Coordinates: Attribute;
};

export async function getFloorEquipments(
  listOfEquipements: SpinalNodeRef[],
  floorName: string
): Promise<EquipementInfo[]> {
  const EquipmentsList: EquipementInfo[] = [];

  for (const equ of listOfEquipements) {
    const equiInfo: EquipementInfo = {
      Equipement: equ,
      Coordinates: null  
    };
    const parents: SpinalNodeRef[] = await SpinalGraphService.getParents(equ.id.get(), ["hasBimObject"]);
    const roomParent = parents.find(elt => elt.type.get() === "geographicRoom");//ajouter une condition après sur la pièce pour vérifier que c'est une zoon d'un open space 

    if (roomParent) {
      const floorParents: SpinalNodeRef[] = await SpinalGraphService.getParents(roomParent.id.get(), ["hasGeographicRoom"]);
      const floorParent = floorParents.find(elt => elt.type.get() === "geographicFloor");

      if (floorParent && floorParent.name.get() === floorName) {
        const RealNode = await SpinalGraphService.getRealNode(equ.id.get());
        const attributes = await serviceDocumentation.getAttributesByCategory(RealNode, "Spatial", "XYZ center");

        // Vérifie que 'attributes' contient au moins un élément
        equiInfo.Coordinates = attributes[0] || null; 

        EquipmentsList.push(equiInfo);
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
      const floorParent = floorParents.find(elt => elt.type.get() === "geographicFloor");

      if (floorParent && floorParent.name.get() === floorName) {
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
  DistanceConst : number
): SpinalNodeRef[] {
  
  const equipForPosition: SpinalNodeRef[] = [];

  if (PosInFloor.Coordinates && PosInFloor.Coordinates.value) {
    const posCoord = PosInFloor.Coordinates.value.get();
    const [posXcoor, posYcoor, posZcoor] = String(posCoord).split(";").map(Number);

    for (const equ of ListOfequipInFloor) {
      if (equ.Coordinates && equ.Coordinates.value) {
        const equipCoord = equ.Coordinates.value.get();
        const [equipXcoor, equipYcoor, equipZcoor] = String(equipCoord).split(";").map(Number);

        const distance = Math.sqrt(
          Math.pow(posXcoor - equipXcoor, 2) +
          Math.pow(posYcoor - equipYcoor, 2) +
          Math.pow(posZcoor - equipZcoor, 2)
        );
        //console.log("distance between",PosInFloor.Position.name.get(),"and",lum.Luminaire.name.get(),"is : ",distance)
        if (distance < DistanceConst) {
          equipForPosition.push(equ.Equipement);
        }
      }
      
      else {
        console.log("Attribute not found for equipement", equ.Equipement.name?.get());
      }
    }
  } else {
    console.log("Attribute not found for position", PosInFloor.Position?.name?.get());
  }

  return equipForPosition;
}


/*export async function getFloorPositions(
  listOfPositions: SpinalNodeRef[],
  listOfLuminaires: SpinalNodeRef[],
  floorName: string
): Promise<IRoomPosition> {
  const positionsInFloor: IRoomPosition = new Map<RoomNodeRef, RoomInfo>();

  // Combiner les listes des positions de travail et des luminaires
  const allElements = [
    ...listOfPositions.map(pos => ({ node: pos, type: "position" })),
    ...listOfLuminaires.map(lum => ({ node: lum, type: "luminaire" }))
  ];

  // Parcourir tous les éléments pour regrouper les informations par pièce et étage
  for (let element of allElements) {
    const parents: RoomNodeRef[] = await SpinalGraphService.getParents(element.node.id.get(), ["hasBimObject"]);
    const roomParent = parents.find(elt => elt.type.get() === "geographicRoom");

    if (roomParent) {
      const floorParents: SpinalNodeRef[] = await SpinalGraphService.getParents(roomParent.id.get(), ["hasGeographicRoom"]);
      const floorParent = floorParents.find(elt => elt.type.get() === "geographicFloor");

      if (floorParent && floorParent.name.get() === floorName) {
        let roomInfo = positionsInFloor.get(roomParent);
        
        if (!roomInfo) {
          roomInfo = { postiontravails: [], luminaires: [] };
          positionsInFloor.set(roomParent, roomInfo);
        }

        // Ajouter l'élément dans le tableau approprié de RoomInfo
        if (element.type === "position") {
          roomInfo.postiontravails.push(element.node);
        } else if (element.type === "luminaire") {
          roomInfo.luminaires.push(element.node);
        }
      }
    }
  }

  return positionsInFloor;
}*/






/*async function testGetFloorPositions(PositionNames: string[], option: { selectedNode: SpinalNodeRef, context: SpinalNodeRef }) {
  const itms = await getFloorPositions([],[], "floorName")
  for (const [nodeRefRoom, roomInfo] of itms) {
    for (const pos of roomInfo.postiontravails) {
      if ((!PositionNames.includes(pos.name.get())))
        await SpinalGraphService.addChildInContext(option.selectedNode.id.get(), pos.id.get(),
          option.context.id.get(), "hasNetworkTreeBimObject", "PtrLst");
      // pour les positions de travail calcule la position de la lumiere
      // si distance < 2m alors ajoute la lumiere a la liste des lumieres de la position de traivail

    }
  }


}*/

export async function addPositionToNetwork(EquipmentsForPosition: SpinalNodeRef[],pos:SpinalNodeRef, option: { selectedNode: SpinalNodeRef, context: SpinalNodeRef }) {
  
 let existedPos : SpinalNodeRef[]=[];
 
 existedPos = await SpinalGraphService.getChildren(option.selectedNode.id.get(), ["hasNetworkTreeBimObject"]);
 let  PositionNames : string[] = [] ;

 PositionNames = existedPos.map(elt => elt.name.get());
 if(!PositionNames.includes(pos.name.get())){

  console.log("adding position to network")
    const Posnode = await SpinalGraphService.addChildInContext(option.selectedNode.id.get(), pos.id.get(),
      option.context.id.get(), "hasNetworkTreeBimObject", "PtrLst");
      for (const equ of EquipmentsForPosition) {
        await SpinalGraphService.addChildInContext(Posnode.info.id.get(), equ.id.get(),
          option.context.id.get(), "hasNetworkTreeBimObject", "PtrLst");
     }
 }
 else {
   console.log("Position already exists")
 }


}