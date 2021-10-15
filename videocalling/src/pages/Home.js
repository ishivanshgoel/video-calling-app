import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useHistory } from "react-router-dom";
import './css/home.css'

export default function SimpleContainer() {

  const [code, setCode] = useState('')
  let history = useHistory()

  const newMeeting = async()=>{
    let url = 'http://localhost:5000/newCall'
    try{
      const response = await fetch( url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    let ans = await response.json()
    setCode(ans.id)
    } catch(err){
      console.log('Cannot get meeting code')
    }
  }

  const joinMeeting = async()=>{
    if(!code) return
    history.push(`/meeting/${code}`)
  }


  return (
    <div className="homepage_main">
      <div className="homepage_main_left">
        <div className="homepage_main_left_button">
          <Button variant="contained" onClick={newMeeting}>Start New Meeting</Button>
        </div>
        <div className="homepage_main_left_input" style={{ margin: 20 }}>
          <TextField label="Enter code to Join Meeting" variant="outlined" value={code} onChange={(event)=>setCode(event.target.value)} />
        </div>
        <div className="homepage_main_left_button2" style={{ margin: 5 }}>
          <Button variant="contained" onClick={joinMeeting}>Join</Button>
        </div>
      </div>
      <div className="homepage_main_right">
        <div></div>
      </div>
    </div>
  );
}