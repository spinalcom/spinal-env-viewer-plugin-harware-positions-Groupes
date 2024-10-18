

export async function getRoomsFromSpatialContext(FloorName) {
    try {
        const ContextName = "spatial";
        const spatial = spinal.spinalGraphService.getContext(ContextName);
        const spatialID = spatial?.info?.id?.get();

        if (!spatialID) {
            console.log(`No context found for ${ContextName}`);
            return;
        }

        const Building = await spinal.spinalGraphService.getChildren(spatialID, ["hasGeographicBuilding"]);

        if (Building.length !== 0) {
            const BuildingID = Building[0].id.get();
            const Floors = await spinal.spinalGraphService.getChildren(BuildingID, ["hasGeographicFloor"]);

            if (Floors.length !== 0) {
                const FloorID = Floors.find(elt => elt.name.get() === FloorName)?.id.get();

                if (FloorID) {
                    const Rooms = await spinal.spinalGraphService.getChildren(FloorID, ["hasGeographicRoom"]);

                    if (Rooms.length !== 0) {
                        console.log("Rooms found:", Rooms);
                        return Rooms;
                    } else {
                        console.log(`No rooms found for the floor: ${FloorName}`);
                    }
                } else {
                    console.log(`Floor named ${FloorName} not found in the building`);
                }
            } else {
                console.log("No floors found in the building");
            }
        } else {
            console.log("No building found in the context");
        }
    } catch (error) {
        console.error("Error occurred:", error);
    }
}

export async function getLum(ContextName, CategoryName, GroupName) {
    try {
        const Context = spinal.spinalGraphService.getContext(ContextName);
        if (!Context) {
            console.log("Context not found");
            return;
        }

        const ContextID = Context.info.id.get();
        const category = (await spinal.spinalGraphService.getChildren(ContextID, ["hasCategory"])).find(child => child.name.get() === CategoryName);

        if (!category) {
            console.log("Category 'Typologie' not found");
            return;
        }

        const categoryID = category.id.get();
        const Groups = await spinal.spinalGraphService.getChildren(categoryID, ["hasGroup"]);
        if (Groups.length === 0) {
            console.log("No groups found under the category");
            return;
        }

        const LumGroup = Groups.find(group => group.name.get() === GroupName);
        if (!LumGroup) {
            console.log("Group 'Luminaire' not found");
            return;
        }

        console.log("Group 'Luminaire' found:", LumGroup);

        const Lum = await spinal.spinalGraphService.getChildren(LumGroup.id.get(), ["groupHasBIMObject"]);
        if (Lum.length === 0) {
            console.log("No luminaires found in the group");
            return;
        }

        console.log("Luminaires found:", Lum);
        return Lum;

    } catch (error) {
        console.error("Error in getLum:", error);
    }
}

export async function getPositions(ContextName, CategoryName, GroupName) {
    try {
        const Context = spinal.spinalGraphService.getContext(ContextName);
        if (!Context) {
            console.log("Context not found");
            return;
        }

        const ContextID = Context.info.id.get();
        const category = (await spinal.spinalGraphService.getChildren(ContextID, ["hasCategory"])).find(child => child.name.get() === CategoryName);
        if (!category) {
            console.log("Category 'Typologie' not found");
            return;
        }

        const categoryID = category.id.get();
        const Groups = await spinal.spinalGraphService.getChildren(categoryID, ["hasGroup"]);
        if (Groups.length === 0) {
            console.log("No groups found under the category");
            return;
        }

        const PosGroup = Groups.find(group => group.name.get() === GroupName);
        if (!PosGroup) {
            console.log("Group 'Positions de travail' not found");
            return;
        }

        console.log("Group 'Positions de travail' found:", PosGroup);

        const Positions = await spinal.spinalGraphService.getChildren(PosGroup.id.get(), ["groupHasBIMObject"]);
        if (Positions.length === 0) {
            console.log("No positions found in the group");
            return;
        }

        console.log("Positions found:", Positions);
        return Positions;

    } catch (error) {
        console.error("Error in getPositions:", error);
    }
}

export async function getFloorPositions(ListOfPositions, FloorName) {
    const PositionInFloor = [];

    for (let pos of ListOfPositions) {

        const parents = await spinal.spinalGraphService.getParents(pos.id.get(), ["hasBimObject"]);
        const roomParent = parents.find(elt => elt.type.get() === "geographicRoom");

        if (roomParent) {

            const floorParents = await spinal.spinalGraphService.getParents(roomParent.id.get(), ["hasGeographicRoom"]);
            const floorParent = floorParents.find(elt => elt.type.get() === "geographicFloor");


            if (floorParent && floorParent.name.get() === FloorName) {
                PositionInFloor.push(pos); // Add the position to the result if it belongs to the specified floor
            }
        }
    }

    return PositionInFloor; // Return the list of positions in the specified floor
}


export async function matchLumWithRoom(EquipementContext, TypologyCategory, LuminaireGroup, RoomsInFloor) {
    const Luminaires = await getLum(EquipementContext, TypologyCategory, LuminaireGroup);

    if (!RoomsInFloor || !Luminaires) {
        console.log("Rooms or Luminaires data is missing");
        return [];
    }

    const Room_Lum_List = [];

    for (const room of RoomsInFloor) {
        const RoomID = room.id.get();
        const roomData = [RoomID];

        for (const lum of Luminaires) {
            const ParentRooms = await spinal.spinalGraphService.getParents(lum.id.get(), ["hasBimObject"]);
            const ParentRoom = ParentRooms.find(parent => parent.type.get() === "geographicRoom");

            if (ParentRoom && ParentRoom.id.get() === RoomID) {
                roomData.push(lum);
            }
        }

        if (roomData.length > 1) {
            Room_Lum_List.push(roomData);
        }
    }

    console.log("Room to Luminaires Mapping (List format):", Room_Lum_List);
    return Room_Lum_List;
}

export async function matchPosWithRoom(EquipementContext, TypologyCategory, PositionGroup, RoomsInFloor) {
    const Positions = await getPositions(EquipementContext, TypologyCategory, PositionGroup);

    if (!RoomsInFloor || !Positions) {
        console.log("Rooms or Positions data is missing");
        return [];
    }

    const Room_Pos_List = [];

    for (const room of RoomsInFloor) {
        const RoomID = room.id.get();
        const roomData = [RoomID];

        for (const Pos of Positions) {
            const ParentRooms = await spinal.spinalGraphService.getParents(Pos.id.get(), ["hasBimObject"]);
            const ParentRoom = ParentRooms.find(parent => parent.type.get() === "geographicRoom");

            if (ParentRoom && ParentRoom.id.get() === RoomID) {
                roomData.push(Pos);
            }
        }

        if (roomData.length > 1) {
            Room_Pos_List.push(roomData);
        }
    }

    console.log("Room to Positions Mapping (List format):", Room_Pos_List);
    return Room_Pos_List;
}

export function findLumAndPosForRoom(Room_Pos_List, Room_Lum_List, RoomID) {
    const positionsForRoom = Room_Pos_List.find(roomData => roomData[0] === RoomID);
    const luminairesForRoom = Room_Lum_List.find(roomData => roomData[0] === RoomID);

    const positions = positionsForRoom ? positionsForRoom.slice(1) : [];
    const luminaires = luminairesForRoom ? luminairesForRoom.slice(1) : [];

    return { positions, luminaires };
}

