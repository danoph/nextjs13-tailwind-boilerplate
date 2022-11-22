import axios from "axios";

const BASE_URL = "http://localhost:3001";

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "application/json"
  }
});

const FileService = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();

    formData.append("file", file);

    return http.post("/api/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress
    });
  }
};

export default FileService;
