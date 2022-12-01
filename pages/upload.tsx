import Head from 'next/head'
import Image from 'next/image'
import prettyBytes from 'pretty-bytes';
import { Uploader } from "../services/Uploader";

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3BottomLeftIcon,
  CogIcon,
  HeartIcon,
  HomeIcon,
  PhotoIcon,
  PlusIcon as PlusIconOutline,
  RectangleStackIcon,
  Squares2X2Icon as Squares2X2IconOutline,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  Bars4Icon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon as PlusIconMini,
  Squares2X2Icon as Squares2X2IconMini,
} from '@heroicons/react/20/solid'

import Uploads from '../components/Uploads';
import ImageService from '../services/ImageService';

const CLOUDFRONT_URL = 'https://dfgeq0nk1hrwc.cloudfront.net';

const navigation = [
  { name: 'Home', href: '#', icon: HomeIcon, current: false },
  { name: 'All Files', href: '#', icon: Squares2X2IconOutline, current: false },
  { name: 'Photos', href: '#', icon: PhotoIcon, current: true },
  { name: 'Shared', href: '#', icon: UserGroupIcon, current: false },
  { name: 'Albums', href: '#', icon: RectangleStackIcon, current: false },
  { name: 'Settings', href: '#', icon: CogIcon, current: false },
]
const userNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Sign out', href: '#' },
]
const tabs = [
  { name: 'Recently Viewed', href: '#', current: true },
  { name: 'Recently Added', href: '#', current: false },
  { name: 'Favorited', href: '#', current: false },
]
const files = [
  {
    Key: 'IMG_4985.HEIC',
    Size: '3.9 MB',
    source:
      'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
    //current: true,
  },
  // More files...
]
const currentFile = {
  name: 'IMG_4985.HEIC',
  size: '3.9 MB',
  source:
    'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  information: {
    'Uploaded by': 'Marie Culver',
    Created: 'June 8, 2020',
    'Last modified': 'June 8, 2020',
    Dimensions: '4032 x 3024',
    Resolution: '72 x 72',
  },
  sharedWith: [
    {
      id: 1,
      name: 'Aimee Douglas',
      imageUrl:
        'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=1024&h=1024&q=80',
    },
    {
      id: 2,
      name: 'Andrea McMillan',
      imageUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixqx=oilqXxSqey&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  ],
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

//export default function App() {
  //const [file, setFile] = useState(undefined)
  //const [uploader, setUploader] = useState(undefined)

  //useEffect(() => {
    //if (file) {
      //let percentage = undefined

     //const videoUploaderOptions = {
        //fileName: "foo",
        //file: file,
      //}
      //const uploader = new Uploader(videoUploaderOptions)
      //setUploader(uploader)

      //uploader
        //.onProgress(({ percentage: newPercentage }) => {
          //// to avoid the same percentage to be logged twice
          //if (newPercentage !== percentage) {
            //percentage = newPercentage
            //console.log(`${percentage}%`)
          //}
        //})
        //.onError((error) => {
          //setFile(undefined)
          //console.error(error)
        //})

      //uploader.start()
    //}
  //}, [file])

  //const onCancel = () => {
    //if (uploader) {
      //uploader.abort()
      //setFile(undefined)
    //}
  //}

  //return (
    //<div className="App">
      //<h1>Upload your file</h1>
      //<div>
        //<input
          //type="file"
          //onChange={(e) => {
            //setFile(e.target?.files?.[0])
          //}}
        ///>
      //</div>
      //<div>
        //<button onClick={onCancel}>Cancel</button>
      //</div>
    //</div>
  //)
//}

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [file, setFile] = useState(undefined)
  const [uploader, setUploader] = useState(undefined)

  const fileAdded = e => {
    const files = [ ...e.target.files ];
    console.log('files', files);
    setFile(files[0]);
  };

  useEffect(() => {
    const completeUpload = async (upload) => {
      const completeResponse = await ImageService.finishMultipartUpload(
        upload.Key,
        upload.UploadId,
        upload.Parts,
      );
    };

    const getUploadParts = async (upload) => {
      const response = await ImageService.listMultipartUploadParts(upload.Key, upload.UploadId);
      console.log('upload parts', response);

      //completeUpload(response.data);
    };

    const abortMultipartUpload = async (upload) => {
      const deleteResponse = await ImageService.abortMultipartUpload(upload.Key, upload.UploadId);
      console.log('deleteREsponse', deleteResponse);
    };

    const getUploads = async () => {
      const { data: { Uploads: uploads } } = await ImageService.listMultipartUploads();

      console.log('multipart uploads', uploads);

      //uploads.forEach(upload => {
        //abortMultipartUpload(upload);
      //});

      getUploadParts(uploads[0]);
      //console.log('response', response);
    };

    getUploads();
  });

  const uploadClicked = () => {
    if (!file) { return }

    console.log('upload clicked', file);

    //const getUploadUrls = async () => {
      //const fileId = "FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s";
      //const fileKey = "MediumTestFile"

      //const chunkSize = 1024 * 1024 * 5;

      //const numberOfParts = Math.ceil(file.size / chunkSize);
      ////ImageService.startMultipartUpload(file.name);
      //const response = await ImageService.getMultipartUploadUrls({
        //fileId,
        //fileKey,
        //parts: numberOfParts
      //});

      //console.log('response', response);
    //};

    //getUploadUrls();

    //const uploadUrls = [
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=9775b397c385832731bfc4e739562f3c3077bf8f42b50821bad914b61161bca9&X-Amz-SignedHeaders=host&partNumber=1&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 1
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=9ec3aa33f634279a24bef4d4cab3e1a5a1f6a11b1baedc27d68cd849bc1757e4&X-Amz-SignedHeaders=host&partNumber=2&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 2
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=a032141496b59905b72cf06f87ee12c758363169b01693d0cfaabaa0bf20d907&X-Amz-SignedHeaders=host&partNumber=3&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 3
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=b91bfa164069eb4d3a3aff4f9e860773f5aadab186e03904c44e499021ad7b72&X-Amz-SignedHeaders=host&partNumber=4&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 4
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=6ede362cdce2dc818182a6795f3812dc797118fe6b20cf97f8b2f267137bd7cc&X-Amz-SignedHeaders=host&partNumber=5&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 5
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=7741a45e01d9fcd1bb30ff700e595c78cf801323aca1d06ba5c6da03c41a60da&X-Amz-SignedHeaders=host&partNumber=6&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 6
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=bc7d7d1784693a0447773c59540bff000b96ad5d8654bb25b08a8f881ee6cd5c&X-Amz-SignedHeaders=host&partNumber=7&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 7
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=aa1fe6e45fe687aa7246e99a70de113345a4997670f85d29eb53f691ec42f3cf&X-Amz-SignedHeaders=host&partNumber=8&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 8
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=0f69ae8c73a6d38d7a4bd94329ff399e991c704c1d4984cc088ffc485b59a705&X-Amz-SignedHeaders=host&partNumber=9&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 9
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=b542b9235024648c3be89d57e6583a549bd42467ad8676e90dc0b7fc6df51346&X-Amz-SignedHeaders=host&partNumber=10&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 10
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=64c10fe33ed61a29b66e81863d4c4dce20843ee53e9b5110eb6079256f9db993&X-Amz-SignedHeaders=host&partNumber=11&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 11
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=651f22e6a5800533feb7025c879a0f6929426a06f05ccfd2d84317cb8041b4bd&X-Amz-SignedHeaders=host&partNumber=12&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 12
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=36f0d5a8c43284d626616e8c018ed3531b6a1a7ac26549faaa6abb5c1d04d5bb&X-Amz-SignedHeaders=host&partNumber=13&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 13
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=bfe64b04b0be6c64fc3abc4ec8daad558bd45939e8354d794fa28e7de99ed144&X-Amz-SignedHeaders=host&partNumber=14&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 14
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=2e0ce694ff4c7c1f70d98bffa8a2f1fe523fd5a79263384ae2633d1762b0120f&X-Amz-SignedHeaders=host&partNumber=15&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 15
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=6f165634b3ecdff49ec955f91199bce1f49e70f82d45349502a10f547e849024&X-Amz-SignedHeaders=host&partNumber=16&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 16
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=116553eb77654b98d44645ca172926ce7c30e5181d7bbc28b677058cd96a08ba&X-Amz-SignedHeaders=host&partNumber=17&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 17
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=2334d97b836319bd7c2b80819d377e2ebd4e6b0095652ada74fb0a5e86e98361&X-Amz-SignedHeaders=host&partNumber=18&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 18
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=be82074483976d5ca850ab149da9d228310a08350e6d3d5421b76bc56938e9b0&X-Amz-SignedHeaders=host&partNumber=19&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 19
      //},
      //{
        //"signedUrl": "https://danoph-image-resizer.s3.us-east-1.amazonaws.com/MediumTestFile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAUB7YTG2OKMURE6FP%2F20221130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221130T213248Z&X-Amz-Expires=3600&X-Amz-Signature=c17edee9961a44728c4392e5b8c9fc13404b53f1a5cedf6a39c6b2a9b75b7cc8&X-Amz-SignedHeaders=host&partNumber=20&uploadId=FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s&x-id=UploadPart",
        //"PartNumber": 20
      //}
    //]
  //};

  //useEffect(() => {
    //if (file) {
      let percentage = undefined

      const videoUploaderOptions = {
        fileName: file.name,
        file: file,
      }

      const uploader = new Uploader(videoUploaderOptions)
      setUploader(uploader)

      uploader
      .onProgress(({ percentage: newPercentage }) => {
        // to avoid the same percentage to be logged twice
        if (newPercentage !== percentage) {
          percentage = newPercentage
          console.log(`${percentage}%`)
        }
      })
      .onError((error) => {
        setFile(undefined)
        console.error('SOME ERROR CAUGHT!', error)
      })

      uploader.start();
  }
  //}, [file])

  const onCancel = () => {
    if (uploader) {
      uploader.abort()
      setFile(undefined)
    }
  }

  return (
    <>
      <Head>
        <title>Image Resizer</title>
        <meta name="description" content="Resize images with AWS lambda" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-full">
        {/* Narrow sidebar */}
        <div className="hidden w-28 overflow-y-auto bg-indigo-700 md:block">
          <div className="flex w-full flex-col items-center py-6">
            <div className="flex flex-shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=white"
                alt="Your Company"
              />
            </div>
            <div className="mt-6 w-full flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800 hover:text-white',
                    'group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <item.icon
                    className={classNames(
                      item.current ? 'text-white' : 'text-indigo-300 group-hover:text-white',
                      'h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  <span className="mt-2">{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 md:hidden" onClose={setMobileMenuOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-indigo-700 pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-1 right-0 -mr-14 p-1">
                      <button
                        type="button"
                        className="flex h-12 w-12 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                        <span className="sr-only">Close sidebar</span>
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=white"
                      alt="Your Company"
                    />
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto px-2">
                    <nav className="flex h-full flex-col">
                      <div className="space-y-1">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'bg-indigo-800 text-white'
                                : 'text-indigo-100 hover:bg-indigo-800 hover:text-white',
                              'group py-2 px-3 rounded-md flex items-center text-sm font-medium'
                            )}
                            aria-current={item.current ? 'page' : undefined}
                          >
                            <item.icon
                              className={classNames(
                                item.current ? 'text-white' : 'text-indigo-300 group-hover:text-white',
                                'mr-3 h-6 w-6'
                              )}
                              aria-hidden="true"
                            />
                            <span>{item.name}</span>
                          </a>
                        ))}
                      </div>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="w-full">
            <div className="relative z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="flex flex-1 justify-between px-4 sm:px-6">
                <div className="flex flex-1">
                  <form className="flex w-full md:ml-0" action="#" method="GET">
                    <label htmlFor="desktop-search-field" className="sr-only">
                      Search all files
                    </label>
                    <label htmlFor="mobile-search-field" className="sr-only">
                      Search all files
                    </label>
                    <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                        <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      </div>
                      <input
                        name="mobile-search-field"
                        id="mobile-search-field"
                        className="h-full w-full border-transparent py-2 pl-8 pr-3 text-base text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:hidden"
                        placeholder="Search"
                        type="search"
                      />
                      <input
                        name="desktop-search-field"
                        id="desktop-search-field"
                        className="hidden h-full w-full border-transparent py-2 pl-8 pr-3 text-base text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:block"
                        placeholder="Search all files"
                        type="search"
                      />
                    </div>
                  </form>
                </div>
                <div className="ml-2 flex items-center space-x-4 sm:ml-6 sm:space-x-6">
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative flex-shrink-0">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80"
                          alt=""
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <a
                                href={item.href}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {item.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  <button
                    type="button"
                    className="flex items-center justify-center rounded-full bg-indigo-600 p-1 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <PlusIconOutline className="h-6 w-6" aria-hidden="true" />
                    <span className="sr-only">Add file</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <div className="flex flex-1 items-stretch overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
                <div className="flex">
                  <h1 className="flex-1 text-2xl font-bold text-gray-900">Photos</h1>
                  <div className="ml-6 flex items-center rounded-lg bg-gray-100 p-0.5 sm:hidden">
                    <button
                      type="button"
                      className="rounded-md p-1.5 text-gray-400 hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    >
                      <Bars4Icon className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Use list view</span>
                    </button>
                    <button
                      type="button"
                      className="ml-0.5 rounded-md bg-white p-1.5 text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    >
                      <Squares2X2IconMini className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Use grid view</span>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-3 sm:mt-2">
                  <div className="sm:hidden">
                    <label htmlFor="tabs" className="sr-only">
                      Select a tab
                    </label>
                    {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                    <select
                      id="tabs"
                      name="tabs"
                      className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      defaultValue="Recently Viewed"
                    >
                      <option>Recently Viewed</option>
                      <option>Recently Added</option>
                      <option>Favorited</option>
                    </select>
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex items-center border-b border-gray-200">
                      <nav className="-mb-px flex flex-1 space-x-6 xl:space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                          <a
                            key={tab.name}
                            href={tab.href}
                            aria-current={tab.current ? 'page' : undefined}
                            className={classNames(
                              tab.current
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                            )}
                          >
                            {tab.name}
                          </a>
                        ))}
                      </nav>
                      <div className="ml-6 hidden items-center rounded-lg bg-gray-100 p-0.5 sm:flex">
                        <button
                          type="button"
                          className="rounded-md p-1.5 text-gray-400 hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                          <Bars4Icon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Use list view</span>
                        </button>
                        <button
                          type="button"
                          className="ml-0.5 rounded-md bg-white p-1.5 text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                          <Squares2X2IconMini className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Use grid view</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                <section className="mt-8 pb-16" aria-labelledby="gallery-heading">
                  <h2 id="gallery-heading" className="sr-only">
                    Recently viewed
                  </h2>
                  <ul
                    role="list"
                    className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
                  >
                    {images.map(image => (
                      <li key={image.Key} className="relative" onClick={() => imageClicked(image)}>
                        <div
                          className={classNames(
                            image.current
                              ? 'ring-2 ring-offset-2 ring-indigo-500'
                              : 'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500',
                            'group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden'
                          )}
                        >
                          <img
                            src={image.source}
                            alt=""
                            className={classNames(
                              image.current ? '' : 'group-hover:opacity-75',
                              'object-cover pointer-events-none'
                            )}
                          />
                          <button type="button" className="absolute inset-0 focus:outline-none">
                            <span className="sr-only">View details for {image.Key}</span>
                          </button>
                        </div>
                        <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                          {image.Key}
                        </p>
                        <p className="pointer-events-none block text-sm font-medium text-gray-500">{prettyBytes(image.Size)}</p>
                      </li>
                    ))}
                  </ul>

                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="files"
                      type="file"
                      onChange={fileAdded}
                      value={inputValue}
                    />
                  </label>

                  <div className="pt-5">
                    <div className="flex">
                      <button
                        type="button"
                        onClick={uploadClicked}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </main>

            {/* Details sidebar */}
          {currentImage && (
            <aside className="hidden w-96 overflow-y-auto border-l border-gray-200 bg-white p-8 lg:block">
              <div className="space-y-6 pb-16">
                <div>
                  <div className="aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg">
                    <img src={currentImage.source} alt="" className="object-cover" />
                  </div>
                  <div className="mt-4 flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        <span className="sr-only">Details for </span>
                        {currentImage.Key}
                      </h2>
                      <p className="text-sm font-medium text-gray-500">{currentImage.Size}</p>
                    </div>
                    <button
                      type="button"
                      className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <HeartIcon className="h-6 w-6" aria-hidden="true" />
                      <span className="sr-only">Favorite</span>
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Information</h3>
                  <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                    <div className="flex justify-between py-3 text-sm font-medium">
                      <dt className="text-gray-500">Uploaded By</dt>
                      <dd className="whitespace-nowrap text-gray-900">{currentImage.Owner.DisplayName}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                      <dt className="text-gray-500">Last Modified</dt>
                      <dd className="whitespace-nowrap text-gray-900">{currentImage.LastModified}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium">
                      <dt className="text-gray-500">Size</dt>
                      <dd className="whitespace-nowrap text-gray-900">{prettyBytes(currentImage.Size)}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm italic text-gray-500">Add a description to this image.</p>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <PencilIcon className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Add description</span>
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Shared with</h3>
                  <ul role="list" className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                    {currentFile.sharedWith.map((person) => (
                      <li key={person.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center">
                          <img src={person.imageUrl} alt="" className="h-8 w-8 rounded-full" />
                          <p className="ml-4 text-sm font-medium text-gray-900">{person.name}</p>
                        </div>
                        <button
                          type="button"
                          className="ml-6 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Remove<span className="sr-only"> {person.name}</span>
                        </button>
                      </li>
                    ))}
                    <li className="flex items-center justify-between py-2">
                      <button
                        type="button"
                        className="group -ml-1 flex items-center rounded-md bg-white p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400">
                          <PlusIconMini className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="ml-4 text-sm font-medium text-indigo-600 group-hover:text-indigo-500">
                          Share
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="flex">
                  <button
                    type="button"
                    className="flex-1 rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className="ml-3 flex-1 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </aside>
          )}
          </div>
        </div>
      </div>
    </>
  )
}
