import { ADD_PEER, REMOVE_PEER } from "./PeerActions";


export type PeerState = Record<string,{stream : MediaStream}>
type PeerAction = 
       | {
            type: typeof ADD_PEER;
            payload: {peerId: string; stream:MediaStream};
        }
       | {
            type: typeof REMOVE_PEER;
            payload: {peerId: string;};
        }
        export const PeersReducer = (state: PeerState, action : PeerAction)=>{
            switch(action.type){
                case ADD_PEER:{
                    console.log("inAdd")
                    return {
                        ...state,
                        [action.payload.peerId]:{
                            stream : action.payload.stream
                        }
                    }
                }
                case REMOVE_PEER:{
                    console.log("inDelete",action)
                    const {[action.payload.peerId]:deleted , ...rest}=state;
                    return rest;
                }

                default :{
                    return {...state};
                }
            }
        }