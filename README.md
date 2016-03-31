**Lacmus** is a script for Wikipedia that assists in article translation. 

![highlight](https://upload.wikimedia.org/wikipedia/commons/c/c7/How_to_use_Lacmus_06.png)

Complete user guide in Russian can be found [here](https://ru.wikipedia.org/wiki/%D0%92%D0%B8%D0%BA%D0%B8%D0%BF%D0%B5%D0%B4%D0%B8%D1%8F:%D0%9B%D0%B0%D0%BA%D0%BC%D1%83%D1%81).

# Buidling

```
gulp
```

builds and minifies the script to `./dist/Lacmus.js`

```
gulp --usercript /path/to/firefox/profile/
```

builds the script as a [userscript](http://wiki.greasespot.net/User_script) to `/path/to/firefox/profile/gm_scripts/Lacmus/Lacmus.user.js`.

You can also use

```
gulp watch
```

with or without `--userscript` to automatically build the script whenever any of the source files change.
