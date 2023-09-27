import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

// import {
//   ToolbarButton,
// } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
// import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import GistItWidget, { PLUGIN_NAME } from './gistitwidget';


export class GistItWidgetExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  constructor(settingRegistry: ISettingRegistry) {
    this._settingRegistry = settingRegistry;
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ) {
    return new GistItWidget(panel, this._settingRegistry);
  }

  // createNew(
  //   panel: NotebookPanel,
  //   context: DocumentRegistry.IContext<INotebookModel>
  // ): IDisposable {
  //   // https://stackoverflow.com/a/40679225
  //   // For debugging in browser console assign panel to a global var
  //   // eval("window.jlpanel = panel;");

  //   // https://jupyterlab.github.io/jupyterlab/apputils/classes/toolbarbutton.html
  //   // https://jupyterlab.github.io/jupyterlab/apputils/interfaces/toolbarbuttoncomponent.iprops.html

  //   const buttons: Array<[string, ToolbarButton]> = [];
  //   buttons.push([
  //     'gistItSend',
  //     new ToolbarButton({
  //       className: 'gistItSend',
  //       iconClass: 'fa fa-github ',
  //       onClick: (): void => {
  //         // downloadNotebookFromBrowser(panel);
  //         console.log("Sup.");
  //       },
  //       tooltip: 'Gist It',
  //       // label: 'GistIt',
  //     })
  //   ]);

  //   buttons.reverse();
  //   buttons.forEach((item) => {
  //     panel.toolbar.insertItem(9, item[0], item[1]);
  //   });
  //   return new DisposableDelegate(() => {
  //     buttons.forEach((item) => {
  //       item[1].dispose();
  //     });
  //   });
  // }

  private _settingRegistry: ISettingRegistry;
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_NAME,
  description: 'Upload Jupyter notebooks to GitHub Gist.',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    settingsRegistry: ISettingRegistry
  ) => {

    // See: jupyterlab-extension-examples/settings
    // Promise.all([app.restored, settings.load(`${PLUGIN_NAME}:settings`)])
    //   .then(([, setting]) => {
    //     // loadSetting(setting);
    //     console.log(setting);

    //     // Listen for your plugin setting changes using Signal
    //     // setting.changed.connect(loadSetting);
    //   })
    //   .catch(reason => {
    //     console.error(
    //       `Something went wrong when reading the settings.\n${reason}`
    //     );
    //   });

    app.docRegistry.addWidgetExtension(
      'Notebook',
      new GistItWidgetExtension(settingsRegistry)
    );
    console.log('JupyterLab extension jupyterlab_gist_it is activated!');

  }
  // activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
  //   console.log('JupyterLab extension jupyterlab_gist_it is activated!');

  //   if (settingRegistry) {
  //     settingRegistry
  //       .load(plugin.id)
  //       .then(settings => {
  //         console.log('jupyterlab_gist_it settings loaded:', settings.composite);
  //       })
  //       .catch(reason => {
  //         console.error('Failed to load settings for jupyterlab_gist_it.', reason);
  //       });
  //   }

  // }
};

// function activate(app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null): void {
//   console.log('JupyterLab extension jupyterlab_gist_it is activated!');

//   if (settingRegistry) {
//     settingRegistry
//       .load(plugin.id)
//       .then(settings => {
//         console.log('jupyterlab_gist_it settings loaded:', settings.composite);
//       })
//       .catch(reason => {
//         console.error('Failed to load settings for jupyterlab_gist_it.', reason);
//       });
//   }

//   app.docRegistry.addWidgetExtension('Notebook', new GistItButtons());
// }

export default plugin;
