/* SystemJS module definition */
declare var module: NodeModule;
declare var jquery: any;
interface NodeModule {
    id: string;
}
interface Jquery {
  tooltip(options?: any): any;
}
