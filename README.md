## upload-oss-lib
A JavaScript library for oss file uploading, only browser supported.

----
## Usage
    var uploadOss = require('upload-oss-lib');
    var UPLOAD_POLICY_API = 'backend api for policy fetching';
    var UPLOAD_FILE_DOMAIN = 'oss domain for file uploding';
    var START_WITH = 'path/prefix';
    // Step 1
    uploadOss.initOSS({
      uploadPolicyApi: UPLOAD_POLICY_API,
      prefixDateTime: true,
      uploadFileDomain: UPLOAD_FILE_DOMAIN,
      startWith: START_WITH
    });
    // Step 2
    uploadOss.upload({
      file: File,
      success: function (ossFileUrl) {
        // do something with it
      }
    });