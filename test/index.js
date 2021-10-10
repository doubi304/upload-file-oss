//example

var uploadOss =  require('..');

var REQUEST_DOMAIN = 'http://example.com/';
var TEMP_URL = `${REQUEST_DOMAIN}/api/`;
var UPLOAD_POLICY_API = `${TEMP_URL}/getUploadPolicy`;
var UPLOAD_FILE_DOMAIN = "https://oss.aliyuncs.com";
var START_WITH = "file/dir";
// 初始化上传
uploadOss.initOSS({
  uploadPolicyApi: UPLOAD_POLICY_API,
  prefixDateTime: true,
  uploadFileDomain: UPLOAD_FILE_DOMAIN,
  startWith: START_WITH
});

// 获取策略
uploadOss.getUploadPolicy({
  success: function(res) {
    console.log('获取策略成功');
  }
});
