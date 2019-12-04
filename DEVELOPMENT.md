# Development

#### Clone the Repository

First, you are going to want to install git. Once you have done this you can clone the repository to a folder of your choice using the following command:

```
git clone git@github.com:JamesLMilner/THREEAR.git
```

#### Install Dependencies

THREE AR uses npm to manage dependencies. You can install the dependencies for the project using:

```
  npm install
```

#### Building THREE AR

You can do a production build, which will also generate the docs using [TypeDoc](https://typedoc.org/), by running

```
npm run build:prod
```

You can do a development build by running:

```
npm run build:dev
```

Most of the time developing you will want to want to watch for changes and automatically rebuild a development build. You can do this doing:

```
npm run build:watch
```

#### Local Debugging

If you want to experiment with the examples locally you can use:

```npm run serve```

This leverages `live-server` which allows instant reloads on changes to the file system. Here if we go to `http://127.0.0.1:8080/examples/basic.html` we can see the basic example app. If you access this from a mobile device and point it at the Hiro marker above you should see a rotating cube and torus appear. 

You might want to remotely debug the page test these using your mobile OS and browser of choice:

* [Remote debugging on Chrome (Android)](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/)
* [Remote debugging on Safari (iOS)](https://medium.com/@sarahelson81/remote-debugging-webpages-in-ios-safari-8fd9b7a79a60)


#### Commiting, Pull Requests and CI

The project uses `tslint` and `prettier` for linting and code formatting respectively. On commit we use `husky` to automatically try and fix linting errors. At the moment to pass CI there must be no linting errors in your source code and `webpack` must build sucessfully.

