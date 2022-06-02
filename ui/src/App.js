import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from '@mui/material/CssBaseline';
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import "./App.css";
// import ImageList from "./Components/ImageList";
import { Backdrop, Link } from "@mui/material";
import logoDark from './assets/images/lacework_dark.svg';
import logoLight from './assets/images/lacework_light.svg';
import ImageSearch from "./Components/ImageSearch";
import ScanResults from "./Components/ScanResults";
import { Box } from "@mui/system";
import LinearProgress from "@mui/material/LinearProgress";
import { Chip } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import ConfigToken from "./Components/ConfigToken";
import Utils from './Components/Utils';
import Release from "./Components/Release";
import BugReportIcon from '@mui/icons-material/BugReport';
const utils = new Utils();

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}

async function isWindows() {
  let windowsSystem = navigator.platform.startsWith('Win');
  return windowsSystem;
}

function App() {
  const ddClient = useDockerDesktopClient();
  let [version,setVersion] = useState("...")
  let [config,setConfig] = useState({auth:{integration_access_token:"_placeholderplaceholderplaceholde"}})
  let [view,setView] = useState("home")
  let [blockScreen,setBlockScreen] = useState(false); 
  let [scanResult,setScanResult] = useState({});
  
  async function getConfig() {
    let cmd = "run.sh"; // replaces lw-scanner
    if(await isWindows()) cmd="run.cmd"; //replaces lw-scanner.exe
    let output = await ddClient.extension.host.cli.exec(cmd,["configure","view"]);
    setConfig(JSON.parse(output.stdout.replace("Current config :","")));
  }
  
  useEffect(() => {
    async function getVersion() {
      let cmd = "run.sh"; // replaces lw-scanner
      if(await isWindows()) cmd="run.cmd"; //replaces lw-scanner.exe
      let output = await ddClient.extension.host.cli.exec(cmd,["version"]);
      let scannerVersion = output.stdout.match(/scanner version: ([0-9.]+)/);
      if(scannerVersion) {
        utils.telemetry({event:"get-version",message:{version:scannerVersion[1]}})
        setVersion(scannerVersion[1])
      } else {
        utils.telemetry({event:"get-version",message:{version:"unknown"}})
        setVersion("unknown")
      }
    }
    getVersion();
    async function getConfig() {
      let cmd = "run.sh"; // replaces lw-scanner
      if(await isWindows()) cmd="run.cmd"; //replaces lw-scanner.exe
      let output = await ddClient.extension.host.cli.exec(cmd,["configure","view"]);
      console.log(output,JSON.parse(output.stdout.replace("Current config :","")));
      setConfig(JSON.parse(output.stdout.replace("Current config :","")));
    }
    getConfig();
  },[ddClient.extension.host.cli])

  async function handleReset() {
    let cmd = "config.sh";
    if(await isWindows()) cmd="config-reset.cmd";
    await ddClient.extension.host.cli.exec(cmd,["reset"]);
    window.location.reload();
  }

  async function handleScan(tag) {
    console.log('scanning ',tag);
    try {
      setView("scan");
      setBlockScreen(true);
      let cmd = "run.sh"; // replaces lw-scanner
      if(await isWindows()) cmd="run.cmd"; //replaces lw-scanner.exe
      const result = await ddClient.extension.host.cli.exec(cmd,["evaluate",tag.split(":")[0],tag.split(":")[1],'-v=false']);
      setBlockScreen(false);
      utils.telemetry({event:"scan",message:"success"})
      setScanResult({result:"ok",results:JSON.parse(result.stdout)})
    } catch(e) {
      console.error(e);
      let errmsg = "";
      if(e.stderr) {
        if(e.stderr.match(/ERROR: /)) {
          errmsg = e.stderr.match(/ERROR: (.*)/)[1];
        } else {
          errmsg = e.stderr;
        }
      } else {
        errmsg = "failed to parse the scan results";
      }
      utils.telemetry({event:"scan",message:"error",error:errmsg})
      setBlockScreen(false);
      setScanResult({result:"error",error:errmsg});
    }
  }

  function renderScanResults() {
    if(view!=="scan") return null;
    return (
      <ScanResults results={scanResult} />
    )
  }

  //If configuration has not been found, show UI for config token
  if(!config?.auth?.integration_access_token.match(/_[0-9a-z]{32}/)) {
    return (
      <DockerMuiThemeProvider>
        <CssBaseline />
        <Box className="App">
          <Box className={"search "+view}>
            <div>
              <img className="logo_front" src={matchMedia("(prefers-color-scheme: dark")?.matches?logoLight:logoDark} alt="" />
            </div>
            <div className={"hide-"+view}>Lacework Scanner Version: {version}</div>
            <div className="chips-top">
              <Link href="https://github.com/l6khq/lacework-docker-extension">
                <Chip icon={<GitHubIcon />} 
                  label="l6khq/lacework-docker-extension" variant="outlined" />
              </Link>
              &nbsp;
              <Link href="">
                <Chip icon={<BugReportIcon />}
                  label="GitHub Issues" variant="outlined" />
              </Link>
            </div>
            <ConfigToken onSuccess={getConfig} />
            <Release />
          </Box>
        </Box>
      </DockerMuiThemeProvider>
    );
  }

  return (
    <DockerMuiThemeProvider>
      <CssBaseline />
      <Box className="App">
        <Box className={"search "+view}>
          <div>
            <img className="logo_front" src={matchMedia("(prefers-color-scheme: dark")?.matches?logoLight:logoDark} alt="" />
          </div>
          <div className={"hide-"+view}>Lacework Scanner Version: {version}</div>
          <div className="chips-top">
            <Link href="https://github.com/l6khq/lacework-docker-extension">
              <Chip icon={<GitHubIcon />} 
                label="l6khq/lacework-docker-extension" variant="outlined" />
            </Link>
            &nbsp;
            <Link href="">
              <Chip icon={<BugReportIcon />}
                label="GitHub Issues" variant="outlined" />
            </Link>
          </div>
          <h2 className={"hide-"+view}>Scan container images using Lacework Inline Scanner</h2>
          <div className={"hide-"+view}>Either choose on the images already pulled by docker, or specify a new one for docker to pull.</div>
          <ImageSearch onChange={handleScan}/>
          <Button onClick={handleReset}>reset lw-scanner configuration</Button>
        </Box>
        {renderScanResults()}
        <Release />
      </Box>
      <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={blockScreen}
        >
          {/*  */}
          <Box sx={{display:'flex', flexDirection: 'column', width: '80%'}}>
            <Box>
              <LinearProgress />
            </Box>
            <Box sx={{display:'block'}}>
                <h2>scanning image...</h2>
            </Box>
          </Box>
      </Backdrop>
    </DockerMuiThemeProvider>
  )
}

export default App;
