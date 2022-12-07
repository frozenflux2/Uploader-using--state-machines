import React, { useState, useRef } from "react";
import { useMachine } from "@xstate/react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import ProgressBar from "react-bootstrap/ProgressBar";
import { AxiosResponse, AxiosProgressEvent } from "axios";
import { toast } from "react-toastify";

import axiosInstance, { axiosRequest } from "../service/index";
import { uploadMachine } from "../machine/upload";

interface GetUploadURLResponse {
  repository: {
    id: string;
    uploadURL: string;
  };
}

const Home = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, send] = useMachine(uploadMachine);
  const currentAxiosRequest = useRef<AbortController | null>(null);

  function startUpload() {
    if (!files?.length) {
      toast.error("No uploaded files!");
      return;
    }

    axiosInstance
      .get("/getUploadURL")
      .then(function (response: AxiosResponse<GetUploadURLResponse>) {
        const { uploadURL } = response.data.repository;
        uploadFiles(uploadURL);
      });
  }

  function onUploadProgress(event: AxiosProgressEvent) {
    if (event?.total) setUploadProgress((event.loaded / event.total) * 100);
  }

  function uploadFiles(url: string) {
    const formData = new FormData();
    const controller = new AbortController();
    currentAxiosRequest.current = controller;

    if (!files?.length) return;
    for (let file of files) {
      formData.append("images", file);
    }

    send("UPLOAD");
    axiosInstance
      .post(
        url,
        { files: formData },
        { onUploadProgress, signal: controller.signal }
      )
      .then(function () {
        send("SUCCESS");
        toast.success("Uploading succed!");
      })
      .catch(function () {
        send("FAIL");
        toast.error("Uploading fail!");
      })
      .finally(() => {
        currentAxiosRequest.current = null;
      });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(e.target.files);
  }

  function retryUpload() {
    send("RESET");
    setUploadProgress(0);
    startUpload();
  }

  function resetUpload() {
    send("RESET");
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function cancelRequest() {
    axiosRequest.cancel();
    currentAxiosRequest.current?.abort();
    send("FAIL");
  }

  return (
    <Container className="mt-5">
      <h1 className="text-center">Upload Page</h1>
      <Form.Group onChange={handleFileChange} className="mt-5">
        <Form.Control type="file" ref={fileInputRef} multiple />
      </Form.Group>
      {state.matches("uploading") && (
        <div className="d-flex align-items-center mt-3">
          <ProgressBar animated now={uploadProgress} className="w-100" />
          <span className="mx-3">{uploadProgress + "%"}</span>
        </div>
      )}
      <Stack
        gap={2}
        className="mt-3 text-center justify-content-center"
        direction="horizontal"
      >
        {state.matches("idle") && (
          <Button variant="primary" onClick={startUpload}>
            Upload
          </Button>
        )}
        {state.matches("fail") && (
          <Button variant="secondary" onClick={retryUpload}>
            Retry
          </Button>
        )}
        {(state.matches("success") || state.matches("fail")) && (
          <Button variant="secondary" onClick={resetUpload}>
            Reset
          </Button>
        )}
        {state.matches("uploading") && (
          <Button variant="danger" onClick={cancelRequest}>
            Cancel
          </Button>
        )}
      </Stack>
    </Container>
  );
};

export default Home;
