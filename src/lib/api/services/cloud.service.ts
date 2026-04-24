import { httpClient } from "../httpClient";

export type BucketTestStep = {
  step: string;
  ok: boolean;
  ms: number;
  error?: string;
  detail?: string;
};

export type BucketTestResult = {
  ok: boolean;
  steps: BucketTestStep[];
};

export const cloudAdmin = {
  testBucket() {
    return httpClient.get<BucketTestResult>("/api/admin/cloud/test/");
  },
};
