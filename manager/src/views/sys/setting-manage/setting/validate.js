import { ElMessage } from "element-plus";
//表单中必填
export function validateRequired(rule, value, callback) {
  if (value !== undefined && value !== null && value !== "") {
    callback();
  } else {
    callback(new Error("必填项不能为空"));
  }
}

// 验证必填项（Element Plus 表单校验为异步，返回 Promise）
export function handleSubmit(that, name) {
  return new Promise((resolve, reject) => {
    const form = that.$refs[name];
    if (!form) {
      ElMessage.error("表单未就绪，请稍后重试");
      reject(new Error("form ref missing"));
      return;
    }
    form.validate((valid) => {
      if (valid) {
        resolve(true);
      } else {
        ElMessage.error("请正确填写内容!");
        reject(new Error("validation failed"));
      }
    });
  });
}
