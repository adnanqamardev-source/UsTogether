"use client";

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';

export interface UploadProgress {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
}

export async function uploadWithProgress(
  file: File,
  path: string,
  onProgress: (progress: UploadProgress) => void
): Promise<string> {
  const fileRef = ref(storage, path);
  const id = path.split('/').pop() || 'upload';

  const uploadTask = uploadBytesResumable(fileRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress({ id, progress, status: 'uploading' });
      },
      (error) => {
        onProgress({ id, progress: 0, status: 'error' });
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress({ id, progress: 100, status: 'complete' });
        resolve(downloadURL);
      }
    );
  });
}

export async function deletePhoto(path: string): Promise<void> {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}

async function getPhotoURL(path: string): Promise<string> {
  const fileRef = ref(storage, path);
  return getDownloadURL(fileRef);
}