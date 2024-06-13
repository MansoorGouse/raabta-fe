import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom"
import { RoomContext } from "../context/RoomContext";
import { VideoPlayer } from "../components/VideoPlayer";
import { PeerState } from "../context/PeerReducer";

export const Room = ()=>{
    const {id}=useParams();
    const {ws,me,stream,peers,muteAudio,setMuteAudio} = useContext(RoomContext);
    useEffect(()=>{
        if(me)ws.emit("join-room",{roomId:id,peerId : me._id})
    },[id, me, ws])
    return(<>
        Hello to {id}
        <div className="grid grid-cols-4 gap-4">
        <VideoPlayer stream={stream} muted={true}/>
        {Object.values(peers as PeerState).map((peer) =>{
           return peer.stream && <VideoPlayer stream={peer.stream} muted={false}/>
        })}
        </div>
        <div>
            <button onClick={()=>{setMuteAudio(!muteAudio)}}>mute</button>
        </div>
        </>)
}