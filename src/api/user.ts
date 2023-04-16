import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

export type UserResult = {
  success: boolean;
  data: {
    /** 用户名 */
    username: string;
    /** 当前登陆用户的角色 */
    roles: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
    /** 信息 */
    message: string;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", baseUrlApi("login"), { data });
};

/** 刷新token */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refreshToken", { data });
};

/** 注册 */
export const getRegister = (data?: object) => {
  return http.request<UserResult>("post", baseUrlApi("register"), { data });
};

/** 上传 */
export const upload = (data?: object, config?: object) => {
  return http.request<UserResult>(
    "post",
    baseUrlApi("upload"),
    { data },
    config
  );
};

/** 发布作业 */
export const publishHomework = (data?: object) => {
  return http.request<UserResult>("post", baseUrlApi("publishHomework"), {
    data
  });
};

/** 获取已发布作业 */
export const getHomeworks = (data?: object) => {
  return http.request<UserResult>("get", baseUrlApi("getHomeworks"), { data });
};

/** 获取作业图片 */
export const getHomeworkImages = (data?: object) => {
  return http.request<UserResult>("get", baseUrlApi("getHomeworkImages"), {
    data
  });
};

/** 获取作业情况 */
export const getHomeworkStates = (param, data?: object) => {
  return http.request<UserResult>(
    "get",
    baseUrlApi("getHomeworkStates"),
    param,
    {
      data
    }
  );
};

/** 删除已发布作业 */
export const deletePublishedHomework = (param, data?: object) => {
  return http.request<UserResult>(
    "get",
    baseUrlApi("deletePublishedHomework"),
    param,
    {
      data
    }
  );
};
/** 修改已发布作业 */
export const updatePublishedHomework = (data?: object) => {
  return http.request<UserResult>(
    "post",
    baseUrlApi("updatePublishedHomework"),
    {
      data
    }
  );
};
/** 提交作业 */
export const submitHomework = (data?: object, config?: object) => {
  return http.request<UserResult>(
    "post",
    baseUrlApi("submitHomework"),
    { data },
    config
  );
};

/** 删除已提交的作业 */
export const deleteSubmitedHomework = (param, data?: object) => {
  return http.request<UserResult>(
    "get",
    baseUrlApi("deleteSubmitedHomework"),
    param,
    {
      data
    }
  );
};

/** 获取个人信息 */
export const getProfile = (param, data?: object) => {
  return http.request<UserResult>("get", baseUrlApi("getProfile"), param, {
    data
  });
};

/** 修改个人信息 */
export const updateProfile = (data?: object) => {
  return http.request<UserResult>("post", baseUrlApi("updateProfile"), {
    data
  });
};
