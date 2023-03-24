import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
type Result = {
  success: boolean;
  data: Array<any>;
};

/**
 * roles：页面级别权限，这里模拟二种 "admin"、"common"
 * admin：管理员角色
 * common：普通角色
 */
export const getAsyncRoutes = () => {
  return http.request<Result>("get", baseUrlApi("/getAsyncRoutes"));
};
