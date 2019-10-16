(function () {
  CKEDITOR.plugins.add('pasteUploadImage', {
    init: function(editor) {

      if (!window.Promise || !window.XMLHttpRequest) {
        alert('Your browser is not supported');
        return;
      }

      if (!editor.config.pasteUploadFileApi) {
        CKEDITOR.error('You must to set config.pasteUploadFileApi in ckeditor/config.js');
        return;
      }

      editor.on('paste', function (event) {
        var dataTransfer = event.data.dataTransfer;
        var filesCount = dataTransfer.getFilesCount();
        var oldUrl = event.data.dataValue;
        var urls = uniq(oldUrl.match(/(?<=img.*?[\s]src=")[^"]+(?=")/gi));
        if (filesCount > 0) {
          for (var i = 0; i < filesCount; i++) {
            var file = dataTransfer.getFile(i);
            // base64（Word多个），只能上传一个。要么支持上传base64，就可以上传2个
            if (oldUrl.match(/<img[\s\S]+data:/i)) {
              var modalUrl = window.URL.createObjectURL(file);
              modal(modalUrl);
              uploadFile(urls[0], modalUrl, file);
            }
            // 网页复制单个
            else if (urls.length) {
              modal(urls[0]);
              uploadFile(urls[0], urls[0], file);
            }
            //本地imagename.png 或 Word单个
            else {
              var modalUrl = window.URL.createObjectURL(file);
              var isCreateImage = true;
              modal(modalUrl);
              uploadFile(oldUrl, modalUrl, file, isCreateImage)
            }
          }
        } else {
          // 网页上传URL
          if (urls.length) {
            for (var i = 0; i < urls.length; i++) {
              modal(urls[i]);
              uploadImageUrl(urls[i]);
            }
          }
        }
      });
      
      function uploadFile (oldUrl, modalUrl, file, isCreateImage) {
        var formData = new FormData();
        formData.append('upload', file);
        var option = {
          url: editor.config.pasteUploadFileApi,
          data: formData
        };
        ajaxPost(option).then(function (text) {
          if (text === 'request time out') {
            updateEditorVal(oldUrl, text, isCreateImage);
            updateModal(modalUrl, text);
            return;
          }
          
          // 接口回调URL
          var newUrl = text;
          updateEditorVal(oldUrl, newUrl, isCreateImage);
          updateModal(modalUrl, true);
        }).catch(function () {
          updateModal(oldUrl, false);
          updateEditorVal(modalUrl, 'failure');
        });
      }

      function uploadImageUrl (oldUrl) {
        var url = editor.config.pasteUploadImageUrlApi || editor.config.pasteUploadFileApi;
        var option = {
          url: url + '?url=' + oldUrl
        };
        ajaxPost(option).then(function (text) {
          if (text === 'request time out') {
            updateEditorVal(oldUrl, text);
            updateModal(oldUrl, text);
            return;
          }
          var newUrl = text;
          updateModal(oldUrl, true);
          updateEditorVal(oldUrl, newUrl);
        }).catch(function () {
          updateModal(oldUrl, false);
          updateEditorVal(oldUrl, 'failure');
        });
      }

      function ajaxPost (option) {
        var timeout = 10000;
        var xhr = new XMLHttpRequest();
        var p = new Promise(function (resolve, reject) {
          option = option || {};
          xhr.open('post', option.url);
          xhr.send(option.data);
          xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && xhr.status == 200) {
              var text =  xhr.responseText;
              var match = text.match(/(?<="|')(http|https):(.+?)(?="|')/g);
              if (match && match[0]) {
                text = match[0].replace(/\\/g, '');
                resolve(text);
              } else {
              // 没有返回图片链接则reject
                reject();
              }
              xhr = null;
            } 
            else if (xhr.readyState === 4 && xhr.status !== 200) {
              reject();
              xhr = null;
            }
          }
        });
        var t = new Promise(function(resolve) {
          var t = setTimeout(function () {
            if (xhr) {
              xhr && xhr.abort();
              resolve('request time out');
              clearTimeout(t);
            }
          }, timeout);
        });
        return Promise.race([p, t]);
      }

      function modal (filename) {
        var html = 
          '<div class="modal-editor-upload" filename="{{filename}}" style="margin-bottom: 5px;border-bottom: 1px solid #ddd;padding-bottom: 5px;">'+
            '<img style="width:40px;height:40px;vertical-align: middle;" src="{{filename}}"/>'+
            '<label style="color:green;"> uploading...</label>'+
          '</div>';
        html = html.replace(/\{\{(.+?)\}\}/g, filename);
        var wrapper = document.querySelector('.modal-editor-upload-wrapper');
        if (!wrapper) {
          var wrapper = document.createElement('div');
          wrapper.className = 'modal-editor-upload-wrapper';
          wrapper.style.cssText = 'width:200px;background-color:#fdfdfd;position:absolute;right: 30px;top: 100px;'
          wrapper.innerHTML = html;
          var edi = document.getElementById('cke_' + editor.name);
          edi.appendChild(wrapper);
          edi.style.position = 'relative';
        } else {
          wrapper.innerHTML += html;
        }
      }
  
      function updateModal (filename, result) {
        var selector = 'div.modal-editor-upload[filename="'+filename+'"]';
        var content = document.querySelector(selector);
        var label = content.querySelector('label');
        if (result === 'request time out') {
          label.innerHTML = ' ' + result;
          label.style.color = 'red';
        } else if (result === true) {
          label.innerHTML = ' success';
          label.style.color = 'green';
        } else {
          label.innerHTML = ' failure';
          label.style.color = 'red';
        }
        var time = result === true ? 3000 : 10000;
        var t = setTimeout(function () {
          var c = document.querySelector(selector);
          document.querySelector('.modal-editor-upload-wrapper').removeChild(c);
          clearTimeout(t);
        }, time);
      }

       // 更新
       function updateEditorVal (oldUrl, newUrl, isCreateImage) {
        var data = editor.getData();
        if (isCreateImage) {
          if (!oldUrl) {
            data = data + '<p><img src="'+newUrl+'"/></p>';
          } else {
            data = data.replace(oldUrl, '<img src="'+newUrl+'"/>');
          }
        } else {
          data = data.replace(oldUrl, newUrl);
        }
        editor.document.$.body.innerHTML = data;
      }

      function uniq (arr) {
        arr = arr || [];
        var list = [];
        for (var i = 0; i < arr.length; i++) {
          if (list.indexOf(arr[i]) < 0) {
            list.push(arr[i]);
          }
        }
        return list;
      }

    }
  });
})();