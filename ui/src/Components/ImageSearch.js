import { useEffect, useState } from 'react';
import { Autocomplete, Button, TextField, Box } from "@mui/material";
import { createDockerDesktopClient } from '@docker/extension-api-client';
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}

function ImageSearch(props) {
  const ddClient = useDockerDesktopClient();

  let [images,setImages] = useState([])
  let [image,setImage] = useState("")
  let [loading,setLoading] = useState(false);

  function handleScan() {
    if(props.onChange) props.onChange(image);
  }

  async function getImages() {
    setLoading(true);
    let images = await ddClient.docker.listImages();
    console.log(images);
    images = images.filter(i=>i.RepoTags).filter(image => image.RepoTags[0])
    .filter(image => image.RepoTags[0]!=="<none>:<none>")
    .map(image => image.RepoTags[0])
    console.log(images);
    setImages(images);
    setLoading(false);
  }

  function handleImageInputChange(e,newValue) {
    setImage(newValue);
  } 
  function handleImageChange(e,newValue) {
    setImage(newValue);
    if(newValue) {
      if(props.onChange) props.onChange(newValue);
    }
  } 

  return (
    <div className={"image_search "+(props.mode==="scan"?"image_scan ":" ")}>
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flexGrow: 1}}>
          <Autocomplete
            freeSolo
            id="combo-box-demo"
            options={images}
            fullWidth={true}
            loading={loading}
            onOpen={getImages}
            noOptionsText="No local images found"
            onInputChange={handleImageInputChange}
            onChange={handleImageChange}
            className="image-select"
            // onInputChange={e=>setImage(e.target.value)}
            renderInput={(params) => <TextField className="image-select-input" variant="filled" {...params} placeholder="Docker Image" />}
          />
        </Box>
        <Box>
          <Button variant="contained" style={{height:'100%', fontSize: '1.2em'}}
            disabled={!image}
            onClick={handleScan}
          >Scan Image</Button>
        </Box>
      </Box>
    </div>
  )
}

export default ImageSearch;