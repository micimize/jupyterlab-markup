import {IRenderMimeRegistry} from '@jupyterlab/rendermime';
import {markupRendererFactory} from "./factories";
import {JupyterFrontEnd, JupyterFrontEndPlugin} from '@jupyterlab/application';


const extension: JupyterFrontEndPlugin<void> = {
    id: '@micimize/jupyterlab-wikify',
    autoStart: true,
    requires: [IRenderMimeRegistry],
    activate: (app: JupyterFrontEnd, registry: IRenderMimeRegistry) => {
        console.log('loaded')
        registry.addFactory(markupRendererFactory);
    }
};


export default extension;
