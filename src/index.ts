import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

/**
 * Initialization data for the jupyterlab_gist_it extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_gist_it:plugin',
  description: 'Upload Jupyter notebooks to GitHub Gist.',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension jupyterlab_gist_it is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('jupyterlab_gist_it settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for jupyterlab_gist_it.', reason);
        });
    }
  }
};

export default plugin;
