import { useEffect, useState } from "react";
import semver from 'semver';

function Release() {
  let [latestRelease,setLatestRelease] = useState("unknown")
  let [currentRelease,setCurrentRelease] = useState(process.env.REACT_APP_RELEASE||"unknown");

  useEffect(() => {
    let version = semver.coerce(process.env.REACT_APP_RELEASE);
    if(version.version) setCurrentRelease(version.version);
    fetch('https://api.github.com/repos/l6khq/lacework-docker-extension/releases')
    .then(result => result.json())
    .then(json => {
      if(json[0]) {
        setLatestRelease(json[0].tag_name||"unavailable");
      }
    })
  },[])

  function showCurrentRelease() {
    return (<span>
      extension version: {process.env.REACT_APP_RELEASE}
    </span>);
  }

  function showUpgradeRelease() {
    if(semver.valid(currentRelease) && semver.valid(latestRelease)) {
      if(semver.cmp(currentRelease,"<",latestRelease))
      return (<span>new release available: {latestRelease}</span>);  
    } else if(!semver.valid(currentRelease) && semver.valid(latestRelease)) {
      return (<span>please upgrade to {latestRelease}</span>);  
    }
    return null;
  }
  return (
    <div className="release">
      {showCurrentRelease()}<br />
      {showUpgradeRelease()}
    </div>
  )
}

export default Release;