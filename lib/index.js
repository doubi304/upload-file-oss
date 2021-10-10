'use strict';

// PostObject
// https://help.aliyun.com/document_detail/31988.html

var axios = require('axios');
// var uuidv1 = require('uuid/v1');

var _uploadPolicyApi;
var _prefixDateTime = false;
var _uploadFileDomain;
var _startWith;
var _policyDataParser;

var policyLoading = false;
var uploadQueue = [];
var policy;
var OSSAccessKeyId;
var signature;
// 时间戳，秒
var expire;

/**
 * 添加前缀0
 * @param {*} v 
 */
function addLeadingZero(v) {
  var str = v.toString();
  return (str.length === 1 ? '0' : '') + str;
}

/**
 * 初始化上传OSS的信息
 * @param {*} param0 
 */
var initOSS = function(options) {
  _uploadPolicyApi = options.uploadPolicyApi !== undefined ? options.uploadPolicyApi : _uploadPolicyApi,
  _prefixDateTime = options.prefixDateTime !== undefined ? options.prefixDateTime : _prefixDateTime;
  _policyDataParser = options.policyDataParser !== undefined ? options.policyDataParser : _policyDataParser;
}

/**
 * 是否过期
 */
var isExpire = function() {
  if (expire) {
    var nowTimestamp = new Date().getTime() / 1000;
    var expireTimestamp = parseInt(expire);
    return nowTimestamp > expireTimestamp;
  }
  return true;
}

/**
 * 获取直传策略
 * @param {*} options 
 */
var getUploadPolicy = function(options) {
  axios.get(_uploadPolicyApi)
    .then(function (res) {
      injectUploadPolicy(_policyDataParser ? _policyDataParser(res.data) : res.data);
      if (options.success) {
        options.success(res);
      }
    });
}

/**
 * 注入直传策略
 * @param {*} options 
 */
var injectUploadPolicy = function(options) {
  policy = options.policy !== undefined ? options.policy : policy;
  OSSAccessKeyId = options.accessid !== undefined ? options.accessid : OSSAccessKeyId;
  signature = options.signature !== undefined ? options.signature : signature;
  expire = options.expire !== undefined ? options.expire : expire;

  _startWith = options.dir !== undefined ? options.dir : _startWith;
  _uploadFileDomain = options.host !== undefined ? options.host : _uploadFileDomain;
}

/**
 * 上传文件
 * @param {*} options { file: File, success: Function(ossFileUrl) }
 */
var upload = function(options) {
  // 如果未获取策略或已过期，需重新获取策略
  if (!policy || isExpire()) {
    // 放入上传队列
    uploadQueue.push(options);
    if (policyLoading) {
      return;
    }
    // 设置标记
    policy = null;
    policyLoading = true;
    // 获取策略
    getUploadPolicy({
      success: function(res) {
        policyLoading = false;
        // 遍历队列
        if (policy) {
          uploadQueue.forEach(function(temp) {
            upload(temp)
          });
          uploadQueue.length = 0;
        }
      } 
    });
    return;
  }

  var keys = [];

  // 添加前缀
  if (_startWith) {
    keys.push(_startWith);
  }

  // 添加日期时间路径
  if (_prefixDateTime) {
    var date = new Date();
    var dateDir = date.getFullYear().toString() + addLeadingZero(date.getMonth() + 1) + addLeadingZero(date.getDate());
    var timeDir = addLeadingZero(date.getHours()) + addLeadingZero(date.getMinutes()) + addLeadingZero(date.getSeconds());
    keys.push(dateDir, timeDir);
  }

  // 浏览器中的 File 对象
  var file = options.file;
  var filename = file.name;//uuidv1();

  keys.push(filename);
  
  // 浏览器中的 FormDate 对象
  var formData = new FormData();
  formData.append('OSSAccessKeyId', OSSAccessKeyId);
  formData.append('policy', policy);
  formData.append('Signature', signature);
  var keyValue = keys.join('/');
  formData.append('key', keyValue);
  formData.append('success_action_status', '200');
  formData.append('file', file);
  formData.append('Content-Disposition', 'attachment');

  // 上传
  axios.post(_uploadFileDomain, formData).then(function (res) {
    if (options.success) {
      keys.unshift(_uploadFileDomain);
      var url = keys.join('/');
      options.success(url);
    }
  })
};

module.exports = {
  initOSS: initOSS,
  upload: upload,
  getUploadPolicy: getUploadPolicy,
  injectUploadPolicy: injectUploadPolicy,
  isExpire: isExpire
};
