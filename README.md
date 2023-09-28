# Gist It!

[![Github Actions Status](https://github.com/adrn/jupyterlab-gist-it/workflows/Build/badge.svg)](https://github.com/adrn/jupyterlab-gist-it/actions/workflows/build.yml)

Upload a Jupyter notebook as a [Gist](https://gist.github.com/) with the click of a
button.

![Gist It Screencast Demo](https://github.com/adrn/jupyterlab-gist-it/blob/main/docs/gist-it-demo.gif?raw=true)

This is a Jupyterlab v4.0-compatible version of the original Jupyter notebook extension
[Gist
it](https://jupyter-contrib-nbextensions.readthedocs.io/en/latest/nbextensions/gist_it/readme.html).

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install jupyterlab_gist_it
```

You may then have to restart your Jupyter server. You will then need to go into the
settings editor under Settings > Settings Editor > Gist It and enter a GitHub personal
access token. You can generate a token following instructions
[here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
We recommend using a (new) [fine-grained
token](https://github.blog/2022-10-18-introducing-fine-grained-personal-access-tokens-for-github/)
with only Gist permissions.

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_gist_it
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_gist_it directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different
terminals to watch for changes in the extension's source and automatically rebuild the
extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and
available in your running JupyterLab. Refresh JupyterLab to load the change in your
browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to
make it easier to debug using the browser dev tools. To also generate source maps for
the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall jupyterlab_gist_it
```

In development mode, you will also need to remove the symlink created by `jupyter
labextension develop` command. To find its location, you can run `jupyter labextension
list` to figure out where the `labextensions` folder is located. Then you can remove the
symlink named `jupyterlab_gist_it` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration
tests (aka user level tests). More precisely, the JupyterLab helper
[Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle
testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
