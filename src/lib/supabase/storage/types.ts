
// Define types for the storage module
export type UploadResult = {
  data: any | null;
  error: Error | null;
};

export type DeleteResult = {
  success: boolean;
  error?: Error | null;
  data?: any;
};
