# pasteUploadImage Ckeditor4 Plugin
Base on paste event,
1. Automatically upload images.
2. Automatically upload image url (parse html get '<img>' src to backend download,then backend will return a new image url).


# usage
html```
1. download plugin(https://ckeditor.com/cke4/addon/pasteUploadImage)
2. copy to ckeditor/plugin category
3. modify ckeditor/config.js:

  // required
  1)config.extraPlugins = 'pasteUploadImage';

  // required
  2)config.pasteUploadFileApi = 'your api';

  // optional
  3)config.pasteUploadImageUrlApi = 'your api';

```

