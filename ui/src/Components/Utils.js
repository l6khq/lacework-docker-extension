class Utils {
  telemetryEvent = async function(data) {
    if(!(process.env.REACT_APP_HONEYCOMB_DATASET && process.env.REACT_APP_HONEYCOMB_TEAM)) return null;
    try {
      fetch(`https://api.honeycomb.io/1/batch/${process.env.REACT_APP_HONEYCOMB_DATASET}`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'X-Honeycomb-Team': process.env.REACT_APP_HONEYCOMB_TEAM
        },
        body: JSON.stringify([{data:{project:'docker-desktop',...data}}]) 
      });
      return null;
    } catch(e) {
      // console.log(e);
      return null;
    }
  }  
  // eslint-disable-next-line no-unused-vars
  telemetry = async function({event,message,error}) {
    this.telemetryEvent({event,message,error})
  }
}

export default Utils;