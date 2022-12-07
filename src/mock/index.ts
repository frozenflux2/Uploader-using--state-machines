import MockAdapter from "axios-mock-adapter";
import uuid from "react-uuid";
import randomstring from "randomstring";

import axiosInstance from "../service";

const mock = new MockAdapter(axiosInstance);

const uploadURL = new RegExp(`/uploadFile/*`);

function generateUploadURL() {
  return (
    process.env.UPLOAD_URL ||
    "https://localhost:3001/uploadFile/" + randomstring.generate()
  );
}

function generateRandomBoolean() {
  return Math.random() < 0.8;
}

function sleep(value: number) {
  return new Promise((resolve) => setTimeout(resolve, value));
}

mock.onGet("/getUploadURL").reply(200, {
  repository: { id: uuid(), uploadURL: generateUploadURL() },
});

mock.onPost(uploadURL).reply(async function (config) {
  if (!generateRandomBoolean()) {
    return [500];
  }

  const total: number = 1024;
  const bytes: number = 1024;

  for (const progress of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
    await sleep(500);
    if (config.onUploadProgress) {
      config.onUploadProgress({ loaded: total * progress, total, bytes });
    }
  }
  return [200, null];
});
