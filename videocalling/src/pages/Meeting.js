import React, { useEffect, useState, useRef } from 'react'
import {
    useParams
} from "react-router-dom";
import { io } from 'socket.io-client';
import { useHistory } from "react-router-dom";
import Peer from 'peerjs';

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


    useEffect(async () => {
        if (socket.connected === false) {
            history.push(`/`)
            alert("Couldn't connect to socket server at the movement")
            return
        }

        let n = window.prompt('Enter Name')
        setName(n)

        socket.emit("joinroom", { name: n, room: id, peerId: 22 });

        let myStreamGlobal = await openStream()
        myVideo.current.srcObject = myStreamGlobal

        let peer = new Peer(n)

        // listen for incoming calls
        peer.on('call', call => {

            // metadata from call

            // send you stream
            call.answer(myStreamGlobal)

            // append user stream to grid
            call.on('stream', (stream) => {
                console.log('Getting Peers stream')
            })

        })

        socket.on("addpartcipant", (data) => {
            console.log('New Participant ', data)
            connectPeers(data.name)
        });

        // when someone joins our room, call them using their peer id
        function connectPeers(name) {
            // send userId in metadata of call
            let options = { metadata: { "name": name } }

            const call = peer.call(name, myStreamGlobal, options)

            call.on('stream', userVideoStream => {
                console.log('Getting User video stream')
            }
            )

            // close video
            call.on('close', () => {
                console.log('User Left')
            })
        }

    }, [])

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
