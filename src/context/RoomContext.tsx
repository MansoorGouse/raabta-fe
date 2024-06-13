import { createContext, useCallback, useEffect, useState,useReducer } from "react";
import { useNavigate } from "react-router-dom";
import SocketIOClient from "socket.io-client";
import Peer from "peerjs";
import {v4 as uuidV4} from "uuid";
import {PeersReducer} from "./PeerReducer";
import { addPeerAction, removePeerAction } from "./PeerActions";
const WS = 'http://13.49.227.240:80'
// const WS='https://2e1a-183-82-4-110.ngrok-free.app'


export const RoomContext = createContext<null | any>(null);
const ws= SocketIOClient(WS);

interface RoomProviderProps {
    children: React.ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = (props) => {
    const { children } = props;
    const navigate = useNavigate();
    const [me,setMe] = useState<Peer>();
    const [muteAudio,setMuteAudio] = useState<Boolean>(false);
    const [stream,setStream] = useState<MediaStream>();
    const [peers,dispatch] = useReducer(PeersReducer,{});

    const enterRoom = ({roomId} : { roomId:"string" })=>{
        console.log(roomId);
        navigate(`room/${roomId}`);
    }
    const handleGetUsers=({particpants}:{particpants: string[]})=>{
       console.log({particpants})
    }
    const removePeer=({peerId}:{peerId:string})=>{
        console.log("peerId",peerId)
        dispatch(removePeerAction(peerId))
    }
    useEffect(()=>{
        const meId= uuidV4();
        const peer= new Peer(meId,{
            config: {'iceServers': [
              { url: 'stun:stun.l.google.com:19302' },
              { url: 'turn:192.158.29.39:3478?transport=udp',
              credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
              username : '28224511:1379330808' }
            ]} /* Sample servers, please use appropriate ones */
          });
        setMe(peer);
        console.log(muteAudio)
            navigator.mediaDevices.getUserMedia({video:true,audio:true}).then((stream)=>{
            setStream(stream)
        })
        ws.on("room-created",enterRoom)
        ws.on("get-users",handleGetUsers)
        ws.on("user-disconnected",removePeer);
    },[])
    useEffect(()=>{
        console.log(muteAudio)
         if(muteAudio){
            stream?.getAudioTracks().forEach(track => track.enabled = false);
         }
         else{
            stream?.getAudioTracks().forEach(track => track.enabled = true);
          }
    },[muteAudio, stream])


    useEffect(()=>{
        if(!me) return;
        if(!stream) return;
        ws.on("user-joined",({peerId})=>{
            console.log("dude")
            console.log(peerId,me)
            const call = me.call(peerId,stream);
            
            call.on("stream",(peerStream)=>{
                console.log("in user-joined with stream")
                dispatch(addPeerAction(peerId,peerStream));
            })
        })

        me.on("call",(call)=>{
            console.log("in call")
            call.answer(stream);
            call.on("stream",(peerStream)=>{
                dispatch(addPeerAction(call.peer,peerStream));
            })
        })
    },[me, stream])
    console.log({peers})
    return (
        <RoomContext.Provider value={{ ws , me, stream,peers,muteAudio,setMuteAudio,setStream}}>
            {children}
        </RoomContext.Provider>
    );
};

