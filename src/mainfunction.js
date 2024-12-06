
import { matchBIMandBMSGateways,FindBMSGateways,FindBimGateways, getFloorPos, gethardwarecontext, addPositionToNetwork, getequipments, getPositions, addEquipementsToPositon } from "./test";
import{AddGrpToPos}from "./findGroupDALI"





export async function hardwarecontexteGeneration(PosContextName, PosCategoryName, GroupPositions,
                                                 GatewayContext, GatewayCat, GatewayGrp,
                                                 NetworkContext,NetworkOrgan,Network,
                                                 HContext,option) {
    //Bim Objects Context For Positions
    const PositionContext = PosContextName;
    const PositionCategory = PosCategoryName;
    const GroupPos = GroupPositions;
    
    // Bim Objects Conecxt For Gatways
    const GatContexte = GatewayContext;
    const GatCategory = GatewayCat;
    const GatGroup = GatewayGrp;
    
    // Network Context
    const NetContext = NetworkContext;
    const NetOrgan = NetworkOrgan;
    const NetName = Network;

    // Hardware context position ==> Luminaiers 
    const HardwareContext = HContext;


    const positionsList = await getPositions(PositionContext, PositionCategory, GroupPos);
    console.log("positionsList :",positionsList)

    const PositionbyFloor = await getFloorPos(positionsList, option.selectedNode.name.get());

    //console.log("PositionbyFloor",PositionbyFloor);
     console.log("Starting process to add positions...")
    for (const pos of PositionbyFloor) {
      console.log("in loop") 
        try {
           
           
          await addPositionToNetwork(pos.Position, option);
      
          console.log("adding position",pos.Position.name.get())
        } catch (error) {
          console.error("Error processing position:", pos.Position.name?.get(), error);
        }
      }
     
      console.log("Starting process to add Groups to positions ...")  

      const bimgatways = await FindBimGateways(GatContexte, GatCategory, GatGroup);
      console.log("bimgatways",bimgatways)
      
      
      const bmsgatways = await FindBMSGateways(NetContext, NetOrgan, NetName);
      console.log("bmsgatways",bmsgatways)
      
      const gatwaysList = await matchBIMandBMSGateways(bimgatways, bmsgatways,option.selectedNode.name.get());
      console.log("match",gatwaysList)
      
      
      const HardwareContextNode = gethardwarecontext(HardwareContext);
      
      for (const gat of gatwaysList) {
        console.log(" starting process for gateway",gat.name.get()) 
          
         await AddGrpToPos(HardwareContextNode,gat,option.selectedNode.name.get(),option.context.id.get())
      }
      console.log("Done")    
}