declare module 'markdown-it-deflist' {
    import MarkdownIt = require('markdown-it');

    namespace markdownItDeflist {
        function deflist_plugin(md: MarkdownIt): void;
    }

    const MarkdownItDeflist: typeof markdownItDeflist.deflist_plugin;
    export = MarkdownItDeflist;
}

declare module 'markdown-it-footnote' {
    import MarkdownIt = require('markdown-it');

    namespace markdownItFootnote {
        function footnote_plugin(md: MarkdownIt): void;
    }

    const MarkdownItFootnote: typeof markdownItFootnote.footnote_plugin;
    export = MarkdownItFootnote;
}

declare module '@gerhobbelt/markdown-it-wikilinks' {
    import MarkdownIt = require('markdown-it');

    namespace markdownItWikilinks {
        function wikilinks_plugin(md: MarkdownIt): void;
    }

    const MarkdownItWikilinks: typeof markdownItWikilinks.wikilinks_plugin;
    export = MarkdownItWikilinks;
}

declare module 'sanitize-filename' {
  namespace Sanitize {
    function sanitize(
      input: string,
      options?: {
        replacement?: string | ((substring: string) => string);
      }
    ): string;
  }
  const sanitize: typeof Sanitize.sanitize;

  export = sanitize;

}
