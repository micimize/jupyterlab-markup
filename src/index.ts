import {IRenderMimeRegistry} from '@jupyterlab/rendermime';
import {markdownItRendererFactory} from "./factories";
import {IMarkdownViewerTracker} from "@jupyterlab/markdownviewer"
import {IEditorTracker} from "@jupyterlab/fileeditor"
import {JupyterFrontEnd, JupyterFrontEndPlugin} from '@jupyterlab/application';


const extension: JupyterFrontEndPlugin<void> = {
    id: '@micimize/jupyterlab-wikify',
    autoStart: true,
    requires: [IRenderMimeRegistry, IMarkdownViewerTracker, IEditorTracker],
    activate: (app: JupyterFrontEnd, registry: IRenderMimeRegistry,
               markdownViewerTracker: IMarkdownViewerTracker,
               editorTracker: IEditorTracker) => {
        console.log('JupyterLab extension @micimize/jupyterlab-wikify is activated!');
        registry.addFactory(markdownItRendererFactory);
    }
};


export default extension;
