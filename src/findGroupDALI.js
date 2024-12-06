export async function geFloorInHardwareContext(PositionContextID,floorName){// récupérer etages dans hardware contexte est filtrer sur un seul 

    Floor = (await spinal.spinalGraphService.getChildren(PositionContextID,"hasNetworkTreeGroup")).find(e=> e.name==floorName)

    return(Floor)
 }

 

export async function getPositionInfo(position) {
    let lisbalastwithpos = []; // Array to store balast, position, and group pairs

    // Fetch luminaires for the position
    const luminaires = await spinal.spinalGraphService.getChildren(position.id.get(), "hasNetworkTreeBimObject");
    if (luminaires.length === 0) {
        return; // Exit if no luminaires are found
    }

    for (const lum of luminaires) {
        // Fetch balasts linked to the luminaire
        const balasts = await spinal.spinalGraphService.getChildren(lum.id.get(), "hasBmsEndpoint");

        if (balasts.length === 0) {
            continue; // Skip if no balasts are found
        }

        for (const balast of balasts) {
            const balastNode = await spinal.spinalGraphService.getRealNode(balast.id.get());
            const balastAttr = await spinal.serviceDocumentation.findOneAttributeInCategory(
                balastNode,
                "OPC Attributes",
                "Name"
            );

            const value = balastAttr?.value?.get();
            if (value) {
                let grpvalue = await spinal.spinalGraphService.getChildren(balast.id.get(), "hasBmsEndpoint");
                grpvalue = grpvalue.find(e => e.name?.get() === "Groups");
                if(grpvalue){
                    let bmsendpoint = await grpvalue.element.load();
                    let bmsvalue = (bmsendpoint.currentValue.get()).toString()
                    if (bmsvalue!="null"){
                        lisbalastwithpos.push({
                            balast: value,
                            pos: position,
                            groupe:bmsvalue // Ensure the group is included correctly
                        });
                  }
                }

                
            }
        }
    }

    // Return the list only if it contains elements
    return lisbalastwithpos.length > 0 ? lisbalastwithpos : undefined;
}



export async function getbalstListInSUbNetwork(subnetwork){
 
 
   const subnetworkChildren  = await spinal.spinalGraphService.getChildren(subnetwork.id.get(),"hasBmsEndpoint") 
   let balasts = subnetworkChildren.filter(e => e.name?.get().includes("Balast"));
   let attributeList=[];

   if (balasts.length!=0){
     
     for (let b of balasts){

         const balastNode = await spinal.spinalGraphService.getRealNode(b.id.get());
         const balastAttr = await spinal.serviceDocumentation.findOneAttributeInCategory(balastNode, "OPC Attributes", "Name");
         
         const value = balastAttr.value.get()
         if(value){
             attributeList.push(value)
         }
 
     }
   }
   return attributeList;
}

export async function getGrpInNetwork(subnetwork) {

 const subnetworkChildren  = await spinal.spinalGraphService.getChildren(subnetwork.id.get(),"hasBmsEndpoint") 
 const groups = subnetworkChildren.filter(e => e.name?.get().includes("Grp DALI"));
 return groups;
}

export async function matchgroups(balastPosList, balastBUStList) {
    // Initialise une liste pour stocker les parents uniques
    let parentsList = [];

    for (let e of balastPosList) {
        // Vérifie si l'attribut de balast est dans la liste balastBUStList
        if (balastBUStList.includes(e.balast)) {
            let grptopush = "Grp DALI " + e.groupe; // Construire le nom du groupe

            // Ajoute à parentsList si grptopush n'est pas déjà présent
            if (!parentsList.includes(grptopush)) {
                parentsList.push(grptopush);
            }
        }
       //console.log(e)
    }

    // Retourne parentsList s'il contient des éléments, sinon undefined
    return parentsList.length > 0 ? parentsList : undefined;
}






//récupérer d'abord les noeuds positionsContext et Networkcontext

export async function AddGrpToPos(PositionContext,gateway,floorname,GrpcontextID) {
  
    
    
        // Fetch Positione Context and OPC UA Context IDs
        const PositionContextID =PositionContext.info.id.get();
        // hardware context position luminaires
       
        // Fetch SubNetworks -- grp D'ALI 
        console.log("Fetching subnetworks...");
        const subnetworks = await spinal.spinalGraphService.getChildren(gateway.id.get(), "hasBmsEndpoint");
        console.log( "subnetworks found for gateway: ",gateway.name.get(), " \n",subnetworks)
        
        
        if (subnetworks.length !== 0) {
           
            // séparer les bus et les zones et garder que les bus
            let filtredsubNetList = subnetworks.filter(sub => sub.name.get().includes("MRDA"
                ) 
            );
        
            console.log("Liste des sous-réseaux filtrés :", filtredsubNetList);// List to use for the next
        
            // Vérifier si la liste filtrée est vide
            if (filtredsubNetList.length != 0) {
                
           
            for (const sub of filtredsubNetList) {
                 
                const groupeDALI = await getGrpInNetwork(sub);
                console.log(" grp D'ALI Found In subnetwork :", sub.name.get()," \n",groupeDALI)

                const balastBusList = await getbalstListInSUbNetwork(sub);// to be used for the groupe matching
                console.log("balasts found in subnetwork :",sub.name.get()," \n",balastBusList)

                if (groupeDALI.length === 0 || balastBusList.length === 0) {
                    console.error("subnetwork is empty or no balasts/grp DALI found. Skipping...");
                    continue
                }
                    // Fetch Floor in Hardware Context
                    const Floor = await geFloorInHardwareContext(PositionContextID, floorname);
            
                    if (!Floor) {
                        console.error(`No floor named "${floorname}" found in Position hardware context.`);
                        return;
                    }
    
                    // Fetch Positions in Floor
                    const positionsInFloor = await spinal.spinalGraphService.getChildren(Floor.id.get());
                    console.log(positionsInFloor)
                    if (positionsInFloor.length === 0) {
                        console.error("No positions found for this floor.");
                        
                        return;
                    }


                                // Fetch Position Information
                    console.log("Fetching position information...");

                    for (let Posi of positionsInFloor){
                    const posinfolist = await getPositionInfo(Posi)

                    if (posinfolist!=undefined){
                        console.log("\n position info",posinfolist)
                        
                        const Positioncildren = await matchgroups(posinfolist, balastBusList)
                        console.log( "Groupe found for ",Posi.name.get(), Positioncildren)
                        if (Positioncildren!= undefined) {
                            const filtredGrpDALI = groupeDALI.filter(e => Positioncildren.includes(e.name?.get()));// To be added as children for the position
                            console.log( "Groupe found after filter based on ",sub.name.get(),"for position",Posi.name.get(), filtredGrpDALI)
                            for (const Grchild of filtredGrpDALI) {
                       
                                const GrpchildNode = await spinal.spinalGraphService.getRealNode(Grchild.id.get());
                                
                                const posRealnode = await spinal.spinalGraphService.getRealNode(Posi.id.get());
                              
                                
                                   // Vérifier si la position est déja parent du groupe D'ALI ==> si oui passer au prochain groupe
                                const parentOfGrp = await spinal.spinalGraphService.getParents(Grchild.id.get(), "hasNetworkTreeGroup", "PtrLst");

                                if (parentOfGrp.length === 0) {
                                    // Si le groupe n'a pas de parents, ajouter directement la position
                                    console.log("Adding new Grp-Position relationship...", posRealnode, GrpchildNode);

                                    /* crétaion des noeuds --------
                                    let grpname = Grchild.name.get()
                                    // Create a  Node (grp name, Network type)and add it as a child to the position
                                    let nodeID = spinal.spinalGraphService.createNode({name:grpname, type: "network"})
                                    let creatednode = await spinal.spinalGraphService.addChildInContext(Posi.id.get(), nodeID, GrpcontextID, "hasNetworkTreeGroup", "PtrLst")
                                    console.log(creatednode)
                                       
                                    if (creatednode){

                                        console.log(`Groupe "${GrpchildNode.info.name.get()}" added as a child to "${posRealnode.info.name.get()}`);
                                        // ADD created node to the bmsNode
                                        try{creatednode.addChild(GrpchildNode,"hasBmsEndpoint", "PtrLst" );
                                        console.log(creatednode,"added to bmsnode",GrpchildNode)
                                        }
                                        catch(e){
                                            console.error("error adding to bmsnode",e)
                                        }
                                        
                                    }else {console.error(" error creating node for ",Grchild.name.get())}   
                                        
                                        ---fin création des noeuds --------------*/

                                    console.log(`Groupe "${GrpchildNode.info.name.get()}" added as a child to "${posRealnode.info.name.get()}`);
                                } else {
                                    // Si le groupe a des enfants, vérifier si la position existe déjà
                                    const posAsParent = parentOfGrp.filter(par => par.id?.get() === Posi.id.get());

                                    if (posAsParent.length === 0) {
                                        // Si la position n'est pas trouvée parmi les parents, l'ajouter
                                        console.log("Adding new Grp-Position relationship ...", posRealnode, GrpchildNode);
                                        /* crétaion des noeuds --------
                                    let grpname = Grchild.name.get()
                                    // Create a  Node (grp name, Network type)and add it as a child to the position
                                    let nodeID = spinal.pinalGraphService.createNode({name:grpname, type: "network"})
                                    let creatednode = await spinal.spinalGraphService.addChildInContext(Posi.id.get(), nodeID, GrpcontextID, "hasNetworkTreeGroup", "PtrLst")
                                    console.log(creatednode)
                                       
                                    if (creatednode){

                                        console.log(`Groupe "${GrpchildNode.info.name.get()}" added as a child to "${posRealnode.info.name.get()}`);
                                        // ADD created node to the bmsNode
                                        try{creatednode.addChild(GrpchildNode,"hasBmsEndpoint", "PtrLst" );
                                        console.log(creatednode,"added to bmsnode",GrpchildNode)
                                        }
                                        catch(e){
                                            console.error("error adding to bmsnode",e)
                                        }
                                        
                                    }else {console.error(" error creating node for ",Grchild.name.get())}   
                                        
                                        ---fin création des noeuds --------------*/
                                    
                                        console.log(`Groupe "${GrpchildNode.info.name.get()}" added as a child to "${posRealnode.info.name.get()}`);
                                    } else {
                                        // Si la position est déjà parent, passer au prochain groupe
                                        console.log(`Groupe "${GrpchildNode.info.name.get()}" is already a child of "${posRealnode.info.name.get()}". Skipping.`);
                                        continue;
                                    }
                                }

                            }  
                            
                        }
                    }
                  }
                    
            }
          }
          else {console.log("No bus found in the gateway.", gateway.name.get())} 

            
        } else {
            console.error("No subnetworks found in the gateway.", gateway.name.get());
        }  
        
}   

    

