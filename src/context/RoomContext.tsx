import { createContext, useCallback, useEffect, useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import SocketIOClient from "socket.io-client";
import Peer from "peerjs";
import { v4 as uuidV4 } from "uuid";
import { PeersReducer } from "./PeerReducer";
import { addPeerAction, removePeerAction } from "./PeerActions";

const WS = 'http://13.49.227.240:80';
// const WS='http://localhost:8080';

export const RoomContext = createContext<null | any>(null);

const ws = SocketIOClient(WS);

interface RoomProviderProps {
    children: React.ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
    const navigate = useNavigate();
    const [me, setMe] = useState<Peer | null>(null);
    const [muteAudio, setMuteAudio] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [peers, dispatch] = useReducer(PeersReducer, {});
    const [screenSharingId, setScreenSharingId] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [connections,setConnections]=useState<Record<string,string>>({});
    const [screenStream,setScreenStream]=useState<MediaStream>();

    
    const switchStream=(stream:MediaStream)=>{
        // setStream(stream);
        console.log(me?.id);
        if(screenSharingId!==me?.id)setScreenSharingId(me?.id|| "");
        const videoTrack: any = stream?.getTracks().find((track) => track.kind === "video");
        Object.keys(connections).forEach((peerId : string)=>{
            const connectionId : string=connections[peerId];
            me?.getConnection(peerId,connectionId)?.peerConnection
            .getSenders()?.find((sender: any) => sender.track.kind === "video")
            ?.replaceTrack(videoTrack)
            .catch((err: any) => console.error(err));
        })
        
    }
    const shareScreen = ()=>{
        if(!screenSharingId){
            navigator.mediaDevices.getDisplayMedia({}).then((stream)=>{
                switchStream(stream);
                setScreenStream(stream);
        });
        }else{
            if(screenSharingId===me?.id)setScreenSharingId("");
            navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(switchStream);
        }
    }

    const enterRoom = ({ roomId }: { roomId: string }) => {
        console.log(roomId);
        navigate(`room/${roomId}`);
    };

    const handleGetUsers = ({ participants }: { participants: string[] }) => {
        console.log({ participants });
    };

    const removePeer = ({ peerId }: { peerId: string }) => {
        console.log("peerId", peerId);
        dispatch(removePeerAction(peerId));
    };

    useEffect(() => {
        const meId = uuidV4();
        const peer = new Peer(meId, {
            config: {
                'iceServers': [
                    { url: 'stun:stun.l.google.com:19302' },
                    {
                        url: 'turn:192.158.29.39:3478?transport=udp',
                        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                        username: '28224511:1379330808'
                    }
                ]
            }
        });
        setMe(peer);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
        });
        ws.on('connect', () => {
            // console.log('Socket.IO connection established');
    
            // if(stream){
            //     const mediaRecorder = new MediaRecorder(stream);
            //     mediaRecorder.ondataavailable = (event: BlobEvent) => {
            //         if (event.data.size > 0) {
            //             event.data.arrayBuffer().then(buffer => {
            //                 ws.emit('video-stream', buffer);
            //             });
            //         }
            //     };
        
            //     mediaRecorder.start(1000);
            // }
    
            
        });
        ws.on("room-created", enterRoom);
        ws.on("get-users", handleGetUsers);
        ws.on("user-disconnected", removePeer);
        ws.on("user-started-sharing", ({peerId}) => {
            setScreenSharingId(peerId)
            console.log("user-started-shring",peerId)
    });
        ws.on("user-stopped-sharing", () => setScreenSharingId(""));
       

        return () => {
            ws.off("room-created", enterRoom);
            ws.off("get-users", handleGetUsers);
            ws.off("user-disconnected", removePeer);
            ws.off("user-started-sharing");
            ws.off("user-stopped-sharing");
            me?.disconnect();
        };
    }, []);
    useEffect(()=>{
        if(stream){
            // const mediaRecorder = new MediaRecorder(stream);
            // mediaRecorder.ondataavailable = (event: BlobEvent) => {
            //     if (event.data.size > 0) {
            //         event.data.arrayBuffer().then(buffer => {
            //             ws.emit('video-stream', buffer);
            //         });
            //     }
            // };
    
            // mediaRecorder.start(1000);
        }
    },[stream])

    useEffect(() => {
        console.log("scrrenSharingId",screenSharingId)
        if (screenSharingId === me?.id) {
            console.log("here");
            ws.emit("start-sharing", { peerId: screenSharingId, roomId });
        } else {
            console.log("here-2");
            ws.emit("stop-sharing");
        }
    }, [screenSharingId, roomId]);

    useEffect(() => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !muteAudio);
        }
    }, [muteAudio, stream]);

    useEffect(() => {
        if (!me || !stream) return;

        ws.on("user-joined", ({ peerId }) => {
            const call = me.call(peerId, stream);
            call.on("stream", (peerStream) => {
                dispatch(addPeerAction(peerId, peerStream));
            });
        });

        me.on("call", (call) => {
            call.answer(stream);
            setConnections((prev)=>{
               return {...prev,[call.peer]:call.connectionId}
            })
            call.on("stream", (peerStream) => {
                dispatch(addPeerAction(call.peer, peerStream));
            });
        });

        return () => {
            ws.off("user-joined");
            me.off("call");
        };
    }, [me, stream]);

    return (
        <RoomContext.Provider value={{ ws, me, stream, peers, muteAudio, setMuteAudio, setStream,shareScreen,setRoomId,screenSharingId,screenStream}}>
            {children}
        </RoomContext.Provider>
    );
};
