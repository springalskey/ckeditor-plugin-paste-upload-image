# pasteUploadImage Ckeditor4 Plugin
```
Base on paste event,
1. Automatically upload images.
2. Automatically upload image url (parse html get '<img>' src to backend download, will return a new image url).
```

# usage
```
1. download plugin(https://ckeditor.com/cke4/addon/pasteUploadImage)
2. copy to ckeditor/plugins category
3. edit ckeditor/config.js:

   // required
   1) config.extraPlugins = 'pasteUploadImage';

   // required
   2) config.pasteUploadFileApi = 'api';

   // optional
   3) config.pasteUploadImageUrlApi = 'api';

   // pastefromword must add '?' 
   4) config.filebrowserImageUploadUrl = '/api?';

   If you not config 3), will use 1) to instead it.

4. FormData filename = 'upload'

5. uploaded result:
  data = {
    filename: '',
    url: 'new url',
    uploaded: 1
  }

```
