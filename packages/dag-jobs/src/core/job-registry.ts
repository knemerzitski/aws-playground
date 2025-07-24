// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JobRegistry {
  '_example-job:plain-echo-message': {
    payload: string;
    result: {
      type: 'echo';
      message: string;
    };
  };
}
