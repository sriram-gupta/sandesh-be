const events = {


}


const eventToActionHandlersMap = {
    'event': [HANDLER1, HANDLER2]
}


const HANDLER1 = () => {

}
const HANDLER2 = () => {

}
// APPROACHES
// 1. ROOM_EVENT USER_EVENT CHAT_EVENT [Entity POV]

// 2. NEW_ROOM_CREATED , USER_JOINED , USER_LEFT [ Action POV]

/**
 * I think everything can be looked as , doer , doee , action
 * 
 * Memeber 1 Creared room X. 
 * Member 2 joined the room X.
 * Member 3 send chat message to Room X. 
 * 
 * 
 */