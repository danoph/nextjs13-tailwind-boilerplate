import { useState, useEffect, useReducer } from 'react'
import prettyBytes from 'pretty-bytes';
import ImageService from '../services/ImageService';
import { v4 as uuidv4 } from 'uuid';

//https://bezkoder.com/react-hooks-file-upload/

//const createUuid = () => {
  //let dt = new Date().getTime();

  //const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    //const r = (dt + Math.random()*16)%16 | 0;
    //dt = Math.floor(dt/16);
    //return (c === 'x' ? r :(r&0x3|0x8)).toString(16);
  //});

  //return uuid;
//}

const UploadProgressBar = props => {
  const { progress } = props;

  return (
    <div className="relative">
      <div className="overflow-hidden h-2 mt-4 text-xs flex rounded bg-gray-200">
        <div style={{ width: progress + "%" }}
          className={`${
            progress < 100
              ? 'bg-pink-500'
              : 'bg-green-500'
          } shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center`}>
        </div>
      </div>
    </div>
  );
};

const UploadListItem = props => {
  const { upload } = props;
  const { file } = upload;

  return (
    <li
      className="py-4 flex"
    >
      <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>

      <div className="ml-3 flex flex-grow flex-col">
        <span className="text-sm font-medium text-gray-900">
          { file.name }
        </span>
        <span className="text-sm text-gray-500">
          { file.type }
        </span>
        <span className="text-sm text-gray-500">
          { prettyBytes(file.size) }
        </span>

        <UploadProgressBar
          progress={upload.progress}
        />
      </div>
    </li>
  )
}


//https://reactjs.org/docs/hooks-reference.html
//const [state, dispatch] = useReducer(reducer, initialArg, init);
type IStatus = 'QUEUED' | 'UPLOADING' | 'WAITING_FOR_THUMBNAIL' | 'FINISHED';

const STATUSES = {
  QUEUED: 'QUEUED',
  UPLOADING: 'UPLOADING',
  WAITING_FOR_THUMBNAIL: 'WAITING_FOR_THUMBNAIL',
  FINISHED: 'FINISHED',
}

interface IUpload {
  id: string;
  file: File;
  fileName: string;
  progress: number;
  status: IStatus;
}

interface IState {
  uploads: IUpload[];
}

const initialState: IState = {
  uploads: []
};

interface IAction {
  type: string;
  [key: string]: any;
}

const reducer = (state: IState, action: IAction) => {
  switch (action.type) {
    case 'UPDATE_FILE_PROGRESS':
      return {
        ...state,
        uploads: state.uploads.map(
          upload => upload.file.name === action.fileName
          ? { ...upload, progress: action.progress }
          : upload
        )
      };
    case 'UPLOAD_STARTED':
      return {
        ...state,
        uploads: state.uploads.map(
          upload => upload.file.name === action.fileName
          ? { ...upload, status: STATUSES.UPLOADING }
          : upload
        )
      };
    case 'WAITING_FOR_THUMBNAIL':
      return {
        ...state,
        uploads: state.uploads.map(
          upload => upload.file.name === action.fileName
          ? { ...upload, status: STATUSES.WAITING_FOR_THUMBNAIL }
          : upload
        )
      };
    case 'UPLOAD_FINISHED':
      return {
        ...state,
        uploads: state.uploads.map(
          upload => upload.file.name === action.fileName
          ? { ...upload, status: STATUSES.FINISHED }
          : upload
        )
      };
    case 'ADD_UPLOADS':
      return {
        ...state,
        uploads: [ ...state.uploads, ...action.uploads ]
      };
    case 'CLEAR_UPLOADS':
      return {
        ...state,
        uploads: []
      };
    default:
      throw new Error();
  }
}

export default function Uploads({ onUploadComplete }) {
  const [draggingOver, setDraggingOver] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [state, dispatch] = useReducer(reducer, initialState);

  const addFiles = files => {
    const existingFilenames = state.uploads.map(upload => upload.file.name)

    const newUploads = [ ...files ].filter(file => !existingFilenames.includes(file.name))
      .map(file => ({
        id: uuidv4(),
        file,
        fileName: file.name,
        progress: 0,
        status: STATUSES.QUEUED,
      }));

    dispatch({
      type: 'ADD_UPLOADS',
      uploads: newUploads
    });
  };

  //https://www.smashingmagazine.com/2020/02/html-drag-drop-api-react/
  const onFilesChanged = e => {
    addFiles(e.target.files);
  };

  const stopEvent = e => {
    e.preventDefault();
    e.stopPropagation();
  }

  const handleDragEnter = e => {
    stopEvent(e);
  };

  const handleDragLeave = e => {
    stopEvent(e);
    setDraggingOver(false);
  };

  const handleDragOver = e => {
    stopEvent(e);
    setDraggingOver(true);
  };

  const handleDrop = e => {
    stopEvent(e);
    setDraggingOver(false);
    addFiles(e.dataTransfer.files);
  };

  const uploadClicked = e => {
    e.preventDefault();

    state.uploads
      .filter(upload => upload.status === STATUSES.QUEUED)
      .forEach(upload => {
      dispatch({
        type: 'UPLOAD_STARTED',
        fileName: upload.file.name,
      });

      uploadFile(upload);
    });
  };

  const uploadFile = (upload) => {
    //const onUploadComplete = response => {
      //console.log('response', response);
    //};

    const onUploadError = error => {
      console.log('error', error);
    };

    const onUploadProgress = (event) => {
      const percent = Math.round((100 * event.loaded) / event.total);

      dispatch({
        type: 'UPDATE_FILE_PROGRESS',
        fileName: upload.file.name,
        progress: percent
      });
    };

    ImageService.uploadFile(upload.file, onUploadProgress)
      .then(() => {
        dispatch({
          type: 'WAITING_FOR_THUMBNAIL',
          fileName: upload.file.name,
        });

        //onUploadComplete(upload.file);
      })
      .catch(onUploadError);
  };

  useEffect(() => {
    const isFileFinished = async filename => {
      console.log('filename', filename);
      const response = await ImageService.getImageMetadata(filename);
      const data = response.data;
      console.log('is finished response', response);

      if (data.ContentLength > 0) {
        dispatch({
          type: 'UPLOAD_FINISHED',
          fileName: filename
        });
        onUploadComplete(filename, data);
      }
    };

    const interval = setInterval(async () => {
      const pending = state.uploads.filter(upload => upload.status === 'WAITING_FOR_THUMBNAIL');

      await Promise.all(pending.map(upload => {
        isFileFinished(upload.file.name);
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.uploads]);

  const clearClicked = e => {
    e.preventDefault();
    setInputValue("");
    dispatch({ type: 'CLEAR_UPLOADS' });
  };

  const fileItems = state.uploads.map((upload, index) => {
    return (
      <UploadListItem
        upload={upload}
        key={upload.file.name}
      />
    )
  });

  return (
    <main className="Uploads max-w-lg mx-auto pt-10 pb-12 px-4 lg:pb-16">
      <form className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              File Uploads
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This information will be displayed publicly so be careful what you share.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <div
                  className={`${draggingOver
                    ? "border-blue-500"
                    : "border-gray-300"
                  } mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                >
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="files"
                          type="file"
                          className="sr-only"
                          onChange={onFilesChanged}
                          multiple
                          value={inputValue}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Any file up to 1GB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-b border-gray-200">
              <ul className="divide-y divide-gray-200">
                {fileItems}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearClicked}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={uploadClicked}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Upload
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
