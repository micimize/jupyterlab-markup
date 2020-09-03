/*!
 * markdown-it-regexp
 * Copyright (c) 2014 Alex Kocharin
 * MIT Licensed
 */

/**
 * Escape special characters in the given string of html.
 *
 * Borrowed from escape-html component, MIT-licensed
 */
export function escape(html: any) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

	// code assumes you're wrapping HTML attributes in doublequotes:
export function encodeHtmlAttr(value: string) {
	// https://stackoverflow.com/questions/4015345/how-do-i-properly-escape-quotes-inside-html-attributes
  return `${value}`.replace(/"/g, '&#34;');
}
/**
 * Counter for multi usage.
 */
let counter = 0;
let registered_ids: {[id: string]: boolean} = {};

function transformRegExpToOnlyMatchFromStart(regexp: any) {
  // clone regexp with all the flags
  let flags = (regexp.global     ? 'g' : '')
            + (regexp.multiline  ? 'm' : '')
            + (regexp.ignoreCase ? 'i' : '')
            + (regexp.unicode    ? 'u' : '')
            + (regexp.sticky     ? 'y' : '');

  // make sure compound / erroneous(!) regexes are transformed to ALWAYS only match from the start of the input:
  // (f.e.: before this, markdown-it-wikilinks exhibited some very duplication-like behaviour)
  regexp = RegExp('^(?:' + regexp.source + ')', flags);
  return regexp;
}

/**
 * Constructor function
 */
let createPlugin = function createPluginF(regexp: any, config: any) {
  regexp = transformRegExpToOnlyMatchFromStart(regexp);

  config = Object.assign({
    setup: (setup: any, config: any) => config,
    shouldParse: (state: any, match: any) => true,
    postprocessParse: (state: any, token: any) => {},

    escape,
    encodeHtmlAttr,
    regexp
  }, typeof config === 'function' ? { replacer: config } : config);
  if (typeof config.replacer !== 'function') {
    throw new Error('createPlugin(re, config): config.replacer MUST be a replacer function.');
  }
  if (typeof config.shouldParse !== 'function') {
    throw new Error('createPlugin(re, config): config.shouldParse MUST be a function.');
  }
  if (typeof config.postprocessParse !== 'function') {
    throw new Error('createPlugin(re, config): config.postprocessParse MUST be a function.');
  }
  if (typeof config.setup !== 'function') {
    throw new Error('createPlugin(re, config): config.setup MUST be a function.');
  }

  // this plugin can be inserted multiple times,
  // so we're generating unique name for it
  let id = config.pluginId as string;
  if (id && registered_ids['p-' + id]) {
    throw new Error(`Plugin ID '${id}' has already been registered by another plugin or this plugin is registered multiple times.`);
  }
  if (!id) {
    id = 'regexp-' + counter;
    while (registered_ids['p-' + id]) {
      counter++;
      id = 'regexp-' + counter;
    }
    config.pluginId = id;
  }
  registered_ids['p-' + id] = true;

  // closure var
  let plugin_options: any;

  // return value should be a callable function
  // with strictly defined options passed by markdown-it
  let handler = function cbHandler(md: any, options: any) {
    // store use(..., options) in closure
    plugin_options = config.setup(config, options);
    // when user has provided another regex via `setup()`,
    // then we MUST clone that one to ensure it only matches
    // from the start of the input:
    if (regexp.source !== config.regexp.source) {
      regexp = config.regexp = transformRegExpToOnlyMatchFromStart(config.regexp);
    }

    // register plugin with markdown-it
    let id = config.pluginId;
    md.inline.ruler.push(id, parse);

    md.renderer.rules[id] = render;
  };

  function parse(state: any, silent: any) {
    // slowwww... maybe use an advanced regexp engine for this
    const match = config.regexp.exec(state.src.slice(state.pos));
    if (!match) return false;

    if (!config.shouldParse(state, match, config, plugin_options)) {
      return false;
    }

    if (state.pending) {
      state.pushPending();
    }

    // valid match found, now we need to advance cursor
    const originalPos = state.pos;
    const matchlen = match[0].length;
    state.pos += matchlen;

    // don't insert any tokens in silent mode
    if (silent) return true;

    let token = state.push(id, '', 0);
    token.meta = { match: match };
    token.position = originalPos;
    token.size = matchlen;

    config.postprocessParse(state, token, config, plugin_options);

    return true;
  }

  function render(tokens: any, id: any, options: any, env: any) {
    return config.replacer(tokens[id].meta.match, config, plugin_options, env, tokens, id, options);
  }

  return handler;
};

export function reset() {
  counter = 0;
  registered_ids = {};
};


/**
 * Expose `Plugin`
 */

export default createPlugin;