// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JobRegistry {
  // TODO remove
  temporary: {
    payload: string;
    result: {
      type: 'echo';
      message: string;
    };
  };
}
