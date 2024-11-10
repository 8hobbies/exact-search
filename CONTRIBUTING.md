# Contributing

## Build and Run

First, install all dependencies:

```bash
npm install
```

### Desktop Browser Extensions (Chrome, Firefox, Edge)

To build, run

```bash
npm run build
```

The extension is built in the `dist/` directory.

### Firefox Android

To prepare the devices, check out the [_Set up your computer and Android emulator or device_
section](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/).
You can skip the installing `web-ext` step, which has already been installed when you ran `npm
install`.

To build and run on Firefox Android, run

```bash
npm run ff:android -- [adb-device-id]
```

## Lint

Run

```bash
npm run lint
```

## Homepage Content

To make changes to the content of the home page, please edit the files in the folder descriptions/.

## License

Please check out the license information in the README.md file at the root directory of this
repository.
