var RecaptchaPrecacheManager=function(recaptchaPrecache){return new function(recaptchaPrecache){this.params={websiteUrl:null,websiteKey:null,websiteSToken:null,userAgent:""};this.getCacheForHostname=function(postData,tabId,cb){ALogger.log("getCacheForHostname called");var hostname=parseUrl(postData.task.websiteURL).hostname;var cacheContent=recaptchaPrecache.getByHostname(hostname,tabId);ALogger.log("cacheContent by hostname = ",cacheContent);var taskId;if(cacheContent){taskId=cacheContent.fakeTaskId}else{taskId=recaptchaPrecache.create(hostname,postData.task.websiteKey,tabId)}var response={errorId:0,taskId:taskId};cb(response)};this.getSolution=function(postData,tabId,cb){var cacheContent=recaptchaPrecache.getByTaskId(postData.taskId,tabId);ALogger.log("cacheContent by task id = ",cacheContent);var cacheContentByHostname=null;ALogger.log("cacheContent by hostname = ",cacheContentByHostname);var newCacheContent=false;if(cacheContent){if(cacheContent.endTime){recaptchaPrecache.markTaskAsProcessedToContentScript(cacheContent);cb({errorId:0,status:"ready",solution:{gRecaptchaResponse:cacheContent.solution},lifetime:recaptchaPrecache.cacheFreshnessTime-(currentTimestamp()-cacheContent.endTime)})}else if(cacheContent.error){recaptchaPrecache.markTaskAsProcessedToContentScript(cacheContent);cb({errorId:1,errorCode:"error",errorDescription:cacheContent.error})}else{var response={errorId:0,status:"processing"};if(newCacheContent){response.newTaskId=cacheContent.fakeTaskId}cb(response)}}else{return cb({errorId:16,errorCode:"ERROR_NO_SUCH_CAPCHA_ID",errorDescription:"Task you are requesting does not exist in your current task list or has been expired.Tasks not found in active tasks"})}}}(recaptchaPrecache)};