import React, { useEffect, useState, useRef } from 'react'
import {
    useParams
} from "react-router-dom";
import {io} from 'socket.io-client';
import { useHistory } from "react-router-dom";

const socket = io('http://localhost:5000/')

function Meeting() {

    let { id } = useParams();
    const [name, setName] = useState('')

    const history = useHistory()
    const myVideo = useRef() // reference to local video

    // constraints
    function setConstraints() {
        const constraints = {
            // 'audio': {
            //     'echoCancellation': true,
            // },
            'audio': false,
            'video': true
        }
        return constraints
    }

    // open stream
    async function openStream() {
        let cons = setConstraints()
        return await navigator.mediaDevices.getUserMedia(cons);
    }
    

    useEffect(async ()=>{
        if(socket.connected === false){
            history.push(`/`)
            alert("Couldn't connect to socket server at the movement")
            return
        }

        let n = window.prompt('Enter Name')
        setName(n)
        
        socket.emit("joinroom", { name: n, room: id, peerId: 22 });

        socket.on("addpartcipant", (data) => {
            console.log('New Participant ', data)
        });

        let myStreamGlobal = await openStream()
        myVideo.current.srcObject = myStreamGlobal

    },[])

    return (
        <div>
            Meeting {id} {name}
            <div id="Dish">
                <video ref={myVideo} autoPlay className="Camera" muted="muted"></video>
            </div>
        </div>
    )
}

export default Meeting
