import axios from "axios";

//const BASE_URL = "http://localhost:3001";
//const BASE_URL = "https://amjzjluma3.execute-api.us-east-1.amazonaws.com/v1";
const BASE_URL = "https://amjzjluma3.execute-api.us-east-1.amazonaws.com/v2";
const API_BASE_URL = "/api/";
const BUCKET = 'danoph-image-resizer';

const http = axios.create({
  baseURL: BASE_URL,
  //headers: {
    //"Content-type": "application/json"
  //}
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-type": "application/json"
  }
});

//const filePath = generateId();

//function generateId() {
  //let result = '';
  //const characters =
    //'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!-.*()';
  //const length = 10;

  //const charactersLength = characters.length;
  //for (let i = 0; i < length; i += 1) {
    //result += characters.charAt(Math.floor(Math.random() * charactersLength));
  //}

  //const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  //return `${date}_${result}`;
//}

const ImageService = {
  uploadFile: async (file, onUploadProgress) => {
    const { data: { url: uploadUrl, fields } } = await ImageService.getUploadUrl(file.name);
    //const { data: { url: upload } = await ImageService.getUploadUrl("test-resize.txt");
    //console.log('data', data);
    const formData = new FormData();
    //name
    //size
    //type

    //formData.append('Content-Type', file.type);
    //formData.append("key", fields.key);
    Object.entries(fields).forEach(([field, value]) => {
      formData.append(field, value);
    });
    formData.append("file", file);

    //return http.post("/api/uploads", formData, {
    console.log('uploading file', file, uploadUrl);
    return http.post(uploadUrl, formData, {
    //return http.put(uploadUrl, "some text here", {
      //headers: {
        //...formData.getHeaders(),
        //"Content-Type": "multipart/form-data",
        ////"Content-Type": "text/plain",
        ////"Content-Type": file.type,
        //////"Content-Type": "image/png",
        ////"Content-Type": "image/png",
      //},
      onUploadProgress
    });
  },
  getImages: () => {
    return api.get("/images", {
      headers: {
        "Accept": "application/json",
      },
    });
  },
  getUploadUrl: (filename) => {
    return api.post(
      "/upload_url",
      {
        filename: filename,
      },
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );
}
};

export default ImageService;
