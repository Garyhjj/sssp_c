export interface PrintParams {
  input?: { [prop: string]: any };
  output?: { [prop: string]: (...args) => any };
  afterDismiss?: () => void;
}
