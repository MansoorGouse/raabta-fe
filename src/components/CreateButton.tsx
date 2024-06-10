import { useContext } from "react"
import { RoomContext } from "../context/RoomContext"

export const Join : React.FC = ()=>{
    const { ws }= useContext(RoomContext);
    const createRoom=()=>{
        ws.emit("create-room");
    };
    return (
        <button onClick={()=>createRoom()}className="bg-blue-400 py-2 px-8 rounded-lg text-white hover:bg-blue-600">Create New Meeting</button>
    )
}