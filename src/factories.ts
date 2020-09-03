import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import {RenderedMarkdown} from './widgets'

export const MIME_TYPE = 'text/markdown';

/**
 * A mime renderer factory for Markdown.
 */
export const markdownItRendererFactory: IRenderMime.IRendererFactory = {
    safe: true,
    mimeTypes: [MIME_TYPE],
    defaultRank: 60,
    createRenderer: options => {
      console.log('dear god please end my suffering')
      return new RenderedMarkdown(options)
    }
};
