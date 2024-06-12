import { useContext } from "react"
import { RoomContext } from "../context/RoomContext"
import TypingEffect from "react-typing-effect";
import bg from "../static/image.jpg"

export const Home = ()=>{
    const { ws }= useContext(RoomContext);
    const createRoom=()=>{
        ws.emit("create-room");
    };
    return (
     <div style={{
            backgroundColor:'black'
        }}>
            {/* <div className="h-[5px] bg-balck"></div>
        <div className="h-[58px] bg-balck rounded">
        
     <div className="font-mono text-gray-200 text-2xl px-6 py-3" style={{borderBlockEnd:'1.5px solid gray'}}>raabta</div>
        </div> */}
        <div className='rounded-[9px]' style={ {
            height: '100vh',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            border:'0px solid gray'
            }}>
            <div style={{ 
                position: 'fixed', 
                top: '30%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
            }}>
                {/* <div className="bg-yellow-500 h-1 mt-2 mb-2"></div> */}
                <div className="text-gray-200 text-center py-0 text-8xl text-bold font-mono rounded" ><TypingEffect text={["raabta"]} speed={100} eraseSpeed={50} typingDelay={200}></TypingEffect></div>
                <div className="text-gray-200 pb-2 pt-2 font-mono text-xl w-[160vh]"><p className="text-center">connect face-to-face, anytime, anywhere . no middleman, just you and them</p></div>
                {/* <div className="bg-yellow-500 h-1 mt-5 mb-10"></div> */}
            </div>
            <button onClick={() => createRoom()} className="bg-gray-200 py-2 px-8 rounded-lg text-black hover:bg-yellow-600 font-mono text-center" style={{ 
                position: 'fixed', 
                top: '45%', 
                left: '48%', 
                transform: 'translate(-50%, -50%)',
            }} >
                    <i className="material-symbols-outlined px-0 py-0">video_call</i>
            </button>
        </div>
     </div>
          
      )
}