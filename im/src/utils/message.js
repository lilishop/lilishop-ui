import { ElMessage, ElMessageBox, ElNotification } from "element-plus";

export { ElNotification, ElMessage, ElMessageBox };

export function setupLegacyMessage(app) {
  app.config.globalProperties.$message = ElMessage;
  app.config.globalProperties.$notify = ElNotification;
  app.config.globalProperties.$confirm = ElMessageBox.confirm;
  app.config.globalProperties.$prompt = ElMessageBox.prompt;
  app.config.globalProperties.$alert = ElMessageBox.alert;
}
