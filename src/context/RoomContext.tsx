import { createContext, useCallback, useEffect, useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import SocketIOClient from "socket.io-client";
import Peer from "peerjs";
import { v4 as uuidV4 } from "uuid";
import { PeersReducer } from "./PeerReducer";
import { addPeerAction, removePeerAction } from "./PeerActions";

const WS = 'http://13.49.227.240:80';

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
    const [screenShare, setScreenShare] = useState<boolean>(false);

    const startScreenShare = useCallback(() => {
        navigator.mediaDevices.getDisplayMedia({ video: true })
            .then(screenStream => {
                if (stream) {
                    const [videoTrack] = screenStream.getVideoTracks();
                    stream.getVideoTracks().forEach(track => stream.removeTrack(track));
                    stream.addTrack(videoTrack);
                    setStream(stream);
                }
            })
            .catch(error => {
                console.error('Error accessing screen share:', error);
            });
    }, [stream]);

    const stopScreenShare = useCallback(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(userStream => {
                if (stream) {
                    const [videoTrack] = userStream.getVideoTracks();
                    stream.getVideoTracks().forEach(track => stream.removeTrack(track));
                    stream.addTrack(videoTrack);
                    setStream(stream);
                }
            })
            .catch(error => {
                console.error('Error accessing media devices:', error);
            });
    }, [stream]);

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
        if (screenShare) {
            startScreenShare();
        } else {
            stopScreenShare();
        }
    }, [screenShare, startScreenShare, stopScreenShare]);

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

        ws.on("room-created", enterRoom);
        ws.on("get-users", handleGetUsers);
        ws.on("user-disconnected", removePeer);

        return () => {
            ws.off("room-created", enterRoom);
            ws.off("get-users", handleGetUsers);
            ws.off("user-disconnected", removePeer);
        };
    }, []);

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
        <RoomContext.Provider value={{ ws, me, stream, peers, muteAudio, setMuteAudio, setStream, setScreenShare, screenShare }}>
            {children}
        </RoomContext.Provider>
    );
};
