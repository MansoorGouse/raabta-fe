import React, { useEffect, useRef } from "react";


export const VideoPlayer : React.FC<{stream: MediaStream,muted: Boolean}>=({stream,muted})=>{
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(()=>{
        if(videoRef.current)videoRef.current.srcObject=stream;
    },[stream]);
    return (<>
            { muted && <video ref={videoRef} autoPlay muted />}
            { !muted && <video ref={videoRef} autoPlay />}
        </>
)
}