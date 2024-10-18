import { SpinalGraphService, SpinalNode, SpinalNodeRef } from "spinal-env-viewer-graph-service";


type RoomNodeRef = SpinalNodeRef
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



async function testGetFloorPositions(PositionNames: string[], option: { selectedNode: SpinalNodeRef, context: SpinalNodeRef }) {
  const itms = await getFloorPositions([], "floorName")
  for (const [nodeRefRoom, roomInfo] of itms) {
    for (const pos of roomInfo.postiontravails) {
      if ((!PositionNames.includes(pos.name.get())))
        await SpinalGraphService.addChildInContext(option.selectedNode.id.get(), pos.id.get(),
          option.context.id.get(), "hasNetworkTreeBimObject", "PtrLst");
      // pour les positions de travail calcule la position de la lumiere
      // si distance < 2m alors ajoute la lumiere a la liste des lumieres de la position de traivail

    }
  }


}