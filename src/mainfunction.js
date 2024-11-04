import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";
import { attributeService } from "spinal-env-viewer-plugin-documentation-service";
import { NetworkTreeService } from "spinal-env-viewer-plugin-network-tree-service";
import { getFloorEquipments, getFloorPos, findEquForPosition, addPositionToNetwork, getequipments, getPositions } from "./test";






export async function hardwarecontexteGeneration(PosContextName, PosCategoryName, GroupPositions, equContext, equCategory, GroupEquipement, distance,option) {

    const PositionContext = PosContextName;
    const PositionCategory = PosCategoryName;
    const GroupPos = GroupPositions;
    const EquipementsContext = equContext
    const EquipmentsCategory = equCategory
    const Groupequ = GroupEquipement;
    const distance_pos_lum = distance;


    const positionsList = await getPositions(PositionContext, PositionCategory, GroupPos);
    const EquipmentsList = await getequipments(EquipementsContext, EquipmentsCategory, Groupequ);



    const EquipmentsByFloor = await getFloorEquipments(EquipmentsList, option.selectedNode.name.get());

    //console.log(LumByFloor);

    const PositionbyFloor = await getFloorPos(positionsList, option.selectedNode.name.get());

    //console.log(PositionbyFloor);

    for (const pos of PositionbyFloor) {
        const list = findEquForPosition(pos, EquipmentsByFloor, distance_pos_lum)
        console.log(list)
        await addPositionToNetwork(list, pos.Position, option);

    }



     //const selectedNode = SpinalGraphService.getRealNode(option.selectedNode.id.get());
     //const contextNode = SpinalGraphService.getRealNode(option.context.id.get());
     //const positionNode = await selectedNode.getChildrenInContext(contextNode);

    // const PositionNames = positionNode.map(node => node.name.get());

    // for (const pos of positions) {
    //   if ((!PositionNames.includes(pos.name.get())))
    //     await SpinalGraphService.addChildInContext(option.selectedNode.id.get(), pos.id.get(), option.context.id.get(), "hasNetworkTreeBimObject", "PtrLst");

    // }
}