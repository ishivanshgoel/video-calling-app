import React, { useEffect, useState, useRef } from 'react'
import {
    useParams
} from "react-router-dom";
import { io } from 'socket.io-client';
import { useHistory } from "react-router-dom";
import Peer from 'peerjs';
import URL from '../config/baseurl'
import Button from '@mui/material/Button';

const socket = io(URL)

function Meeting() {

    let { id } = useParams();
    const [name, setName] = useState('')
    const [peers, setPeers] = useState({})

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

    // add video stream to grid
    function add(videoStream, name) {
        let Scenary = document.getElementById('Dish');
        let Camera = document.createElement('video');
        Camera.className = 'Camera';
        Camera.setAttribute('id', name)
        Camera.srcObject = videoStream
        Camera.addEventListener('loadedmetadata', () => {
            Camera.play()
        })
        Scenary.appendChild(Camera);
    }

    // remove
    function less(name) {
        let removeCamera = document.getElementById(name)
        removeCamera.parentNode.removeChild(removeCamera)
    }


    useEffect(async () => {
        if (socket.connected === false) {
            history.push(`/`)
            alert("Couldn't connect to socket server at the movement")
            return
        }

        let n = window.prompt('Enter Name')
        setName(n)

        socket.emit("joinroom", { name: n, room: id });

        socket.emit("send-message", { from: n, message: `${n} Joined the Meeting` });

        let myStreamGlobal = await openStream()
        myVideo.current.srcObject = myStreamGlobal

        let peer = new Peer(n)

        // listen for incoming calls
        peer.on('call', call => {

            // metadata from call
            let metadata = call.metadata
            let name = metadata.name

            // send you stream
            call.answer(myStreamGlobal)

            // append user stream to grid
            call.on('stream', (stream) => {
                console.log('Getting Peers stream')
                add(stream, name)
            })

        })

        socket.on("addpartcipant", (data) => {
            console.log('New Participant ', data)
            connectPeers(data.name)
        });

        socket.on("new-message", (data)=>{
            alert(`New Notification from ${data.from} - ${data.message}`)
        })

        // when someone joins our room, call them using their peer id
        function connectPeers(name) {
            // send userId in metadata of call
            let options = { metadata: { "name": name } }

            const call = peer.call(name, myStreamGlobal, options)

            call.on('stream', userVideoStream => {
                console.log('Getting User video stream')
                add(userVideoStream, name)
            }
            )

            // close video
            call.on('close', () => {
                less(name)
            })
        }

    }, [])

    const sendMessage = ()=>{
        let message = window.prompt('Enter Notification')
        socket.emit("send-message", { from: name, message: message });
    }

    return (
        <div>
            <div style={{margin: 20}}>
                <b>Meeting Id:</b> {id}
                &nbsp; &nbsp; &nbsp;<b>My Name:</b> {name}
                <br></br> 
                <Button variant="contained" onClick={sendMessage}>Send Notification</Button>
            </div>
            <div id="Dish">
                <video ref={myVideo} autoPlay className="Camera" muted="muted"></video>
            </div>
        </div>
    )
}

export default Meeting
