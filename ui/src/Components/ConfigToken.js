import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}

function isWindows() {
  let windowsSystem = navigator.platform.startsWith('Win');
  return windowsSystem;
}

function ConfigToken(props) {
  let [account,setAccount] = useState("");
  let [token,setToken] = useState("");
  const ddClient = useDockerDesktopClient();

  function handleClick() {
    let cmd = "config.sh";
    if(isWindows()) cmd="config.cmd";
    //console.log("windows: ",isWindows());
    ddClient.extension.host.cli.exec(cmd,[account,token])
    .then(() => {
      props?.onSuccess()
    })
    .catch((err) => {
      console.error(err);
      ddClient.desktopUI.toast.error("Script Error: "+err.stderr)
    });
  }
  function validEntry() {
    if(!account.match(/^[a-zA-Z0-9-]{3,}(.fra)?$/)) return false;
    if(!token.match(/^_[a-z0-9]{32}$/)) return false;
    return true;
  }

  return (
    <Box  sx={{width: '60%', marginLeft: '20%'}}>
      <h1>Let's get lw-scanner configured!</h1>
      <TextField value={account} onChange={e=>setAccount(e.target.value)} 
        label="Lacework Account (without lacework.net)" fullWidth/>
      <TextField value={token} onChange={e=>setToken(e.target.value)} 
        label="Lacework Scanner Access Token" fullWidth />
      <Button variant="contained" fullWidth onClick={handleClick} disabled={!validEntry()}>Let's go</Button>
    </Box>
  )
}

export default ConfigToken;
