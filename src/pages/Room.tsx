import { useCallback, useContext, useEffect,useState } from "react";
import { useParams } from "react-router-dom"
import { RoomContext } from "../context/RoomContext";
import { VideoPlayer } from "../components/VideoPlayer";
import { PeerState } from "../context/PeerReducer";

export const Room = ()=>{
    const {id}=useParams();
    
    const {ws,me,stream,peers,muteAudio,setMuteAudio,setStream,shareScreen,setRoomId,screenSharingId,screenStream} = useContext(RoomContext);
    useEffect(()=>{
        if(me)ws.emit("join-room",{roomId:id,peerId : me._id})
    },[id, me, ws])
    useEffect(() => {
        setRoomId(id || "");
    }, [id, setRoomId]);

    const screenSharingVideo =
        screenSharingId === me?.id
            ? screenStream
            : peers[screenSharingId]?.stream;

    const { [screenSharingId]: sharing, ...peersToShow } = peers;
   
    return(<>
        Hello to {id}
        <div className="flex flex-cols min-h-screen">
            <div className="flex grow">
                    {screenSharingId && (
                        <div className="w-4/5 pr-4 bg-gray-500 p-4">
                            <VideoPlayer stream={screenSharingVideo} muted={muteAudio}/>
                        </div>
                    )}
                    <div
                        className={`grid gap-4 ${
                            stream ? "w-1/5 grid-col-1" : "grid-cols-4"
                        }`}
                    >
                        {stream && (

                                <VideoPlayer stream={stream} muted={muteAudio}/>
                            
                        )}

                        {Object.values(peersToShow as PeerState)
                            .filter((peer) => !!peer.stream)
                            .map((peer) => (
                            
                                    <VideoPlayer stream={peer.stream} muted={muteAudio} />
                            

                            ))}
                    </div>
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
                }}onClick={()=>{shareScreen()}}><i className={`material-symbols-outlined px-4 py-4 ${screenSharingId ? 'bg-blue-200' : 'bg-blue-400'} rounded-[99px]`}>screen_share</i>
                </button>
            </div>
        </div>
        </>
        )
}