// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, args) => {
    if (browser.name === 'electron') {
      // Mac/Linux
      args['use-file-for-fake-video-capture'] = 'data/video/headtracking.mp4';
      args['ignore-gpu-blacklist'] = true;
      args['enable-gpu-rasterization'] = true;
      args['enable-zero-copy'] = true;
      args['disable-software-rasterizer'] = true;
      args['enable-native-gpu-memory-buffer'] = true;

      // Windows
      // args.push('--use-file-for-fake-video-capture=c:\\path\\to\\video\\my-video.y4m')
    }

    return args
  })
}
