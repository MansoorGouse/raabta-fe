import { useCallback, useContext, useEffect,useState } from "react";
import { useParams } from "react-router-dom"
import { RoomContext } from "../context/RoomContext";
import { VideoPlayer } from "../components/VideoPlayer";
import { PeerState } from "../context/PeerReducer";

export const Room = ()=>{
    const {id}=useParams();
    
    const {ws,me,stream,peers,muteAudio,setMuteAudio,setStream,screenShare,setScreenShare} = useContext(RoomContext);
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
            <button style={{
                position:'fixed',
                top:'90%',
                left:'50%'
            }}onClick={()=>{setMuteAudio(!muteAudio)}}><i className={`material-symbols-outlined px-4 py-4 ${!muteAudio ? 'bg-blue-200' : 'bg-blue-400'} rounded-[99px]`}>mic_off</i>
            </button>
            <button style={{
                position:'fixed',
                top:'90%',
                left:'55%'
            }}onClick={()=>{setScreenShare(!screenShare)}}><i className={`material-symbols-outlined px-4 py-4 ${!screenShare ? 'bg-blue-200' : 'bg-blue-400'} rounded-[99px]`}>screen_share</i>
            </button>
        </div>
        </>)
}