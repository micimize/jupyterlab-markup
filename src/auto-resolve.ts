// based on https://github.com/jupyterlab/jupyterlab/blob/4e7c446dccae5e82b1eba9af3eb1705917bc91a5/packages/rendermime-extension/src/index.ts

/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IDocumentManager } from '@jupyterlab/docmanager';

import {
  ILatexTypesetter,
  IRenderMimeRegistry,
  RenderMimeRegistry,
  standardRendererFactories
} from '@jupyterlab/rendermime';
// import { ITranslator } from '@jupyterlab/translation';

import {capitalCase} from 'change-case'


function defaultStub(fileName: string){
  const header = capitalCase(fileName.split('.')[0])
  return {
    "cells": [
      {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
          `# ${header}`
        ]
      }
    ],
    "metadata": {
    },
    "nbformat": 4,
    "nbformat_minor": 4
  }
}

namespace CommandIDs {
  export const handleLink = 'rendermime:handle-local-link';
}

/**
 * A plugin providing a rendermime registry.
 */
const plugin: JupyterFrontEndPlugin<IRenderMimeRegistry> = {
  id: 'rendermime-auto-resolve',
  // requires: [ITranslator],
  optional: [IDocumentManager, ILatexTypesetter],
  provides: IRenderMimeRegistry,
  activate: activate,
  autoStart: true
};

/**
 * Export the plugin as default.
 */
export default plugin;

/**
 * Activate the rendermine plugin.
 */
function activate(
  app: JupyterFrontEnd,
  // translator: ITranslator,
  docManager: IDocumentManager | null,
  latexTypesetter: ILatexTypesetter | null
) {
  // const trans = translator.load('jupyterlab');
  if (docManager) {
    async function open(path: string, id?: string){
      await docManager.services.contents.get(
        path, { content: false }
      );
      // Open the link with the default rendered widget factory,
      // if applicable.
      const factory = docManager.registry.defaultRenderedWidgetFactory(
        path
      );
      const widget = docManager.openOrReveal(path, factory.name);

      // Handle the hash if one has been provided.
      if (widget && id) {
        widget.setFragment(id);
      }
    }
    const putStub = (path: string) => docManager.services.contents.save(
      path,
      {
        type: 'notebook',
        format: 'json',
        content: defaultStub(path)
      }
    );
    app.commands.addCommand(CommandIDs.handleLink, {
      label: 'Handle Local Link', // trans.__('Handle Local Link'),
      execute: async (args) => {
        const path = args['path'] as string | undefined | null;
        const id = args['id'] as string | undefined | null;
        const autoResolve = (args['autoResolve'] as boolean) || false;

        if (!path) {
          return;
        }

        const fileName = path.split('/').pop();

        if (!autoResolve){
          return open(path, id);
        }

        const extensions =  fileName.includes('.') ? [] : ['.ipynb', '.md']
        for (const extension of extensions){
          try {
            return await open(path + extension, id);
          } catch (e) {
            // we just catch all open attempts.
            // TODO option to autoresolve but not autocreate
            //const lastAttempt = extensions[extensions.length - 1]
            //if (extension == lastAttempt )
          }
        }
        await putStub(path + '.ipynb') // hardcoded default for now
        return open(path + '.ipynb', id)
      }
    });
  }
  return new RenderMimeRegistry({
    initialFactories: standardRendererFactories,
    linkHandler: !docManager
      ? undefined
      : {
          handleLink: (node: HTMLElement, path: string, id?: string) => {
            // If node has the download attribute explicitly set, use the
            // default browser downloading behavior.
            if (node.tagName === 'A' && node.hasAttribute('download')) {
              return;
            }
            // eagerly wires the handleLink args on initial
            app.commandLinker.connectNode(node, CommandIDs.handleLink, {
              autoResolve: node.className.includes('autoresolve'),
              path,
              id
            });
          }
        },
    latexTypesetter: latexTypesetter ?? undefined,
    // translator: translator
  });
}