function error() {
  throw new Error(
    'The "decap-cms-app/init" subpath is only available in ESM environments.\n' +
      'Please make sure you are using it in an ESM context (e.g. with "type": "module" in your package.json).',
  );
}

exports.registerBackend = error;
exports.registerCoreWidgets = error;
exports.registerMapWidget = error;
exports.registerCodeWidget = error;
exports.registerImageComponent = error;
exports.registerLocale = error;
exports.registerAll = error;
exports.init = error;
