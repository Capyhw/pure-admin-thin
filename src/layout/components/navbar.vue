<script setup lang="ts">
import Search from "./search/index.vue";
import Notice from "./notice/index.vue";
import mixNav from "./sidebar/mixNav.vue";
import { useNav } from "@/layout/hooks/useNav";
import Breadcrumb from "./sidebar/breadCrumb.vue";
import topCollapse from "./sidebar/topCollapse.vue";
import Setting from "@iconify-icons/ri/settings-3-line";
import { reactive, ref, onBeforeMount, getCurrentInstance } from "vue";
import { getProfile, updateProfile } from "@/api/user";
import { watch } from "vue";
const {
  layout,
  device,
  logout,
  onPanel,
  pureApp,
  username,
  avatarsStyle,
  toggleSideBar
} = useNav();
const dialogFormVisible = ref(false);
const formLabelWidth = "140px";
const form = reactive({
  name: "",
  studentID: "",
  class: "",
  phoneNumber: "",
  email: ""
});
let storage = null;
/** form持久化 */
watch(form, () => {
  storage.profile = {
    ...form
  };
});
const handlerGetProfile = async () => {
  const { data } = await getProfile({
    params: {
      username: username.value
    }
  });
  console.log(data["results"]);
  const {
    name,
    studentID,
    class: studentClass,
    phoneNumber,
    email
  } = data["results"][0];
  form.name = name;
  form.studentID = studentID;
  form.class = studentClass;
  form.phoneNumber = phoneNumber;
  form.email = email;
  dialogFormVisible.value = true;
};

const handlerUpdatePJrofile = async () => {
  const _result = await updateProfile({ username: username.value, ...form });
  dialogFormVisible.value = false;
};

onBeforeMount(() => {
  storage =
    getCurrentInstance()!.appContext.app.config.globalProperties.$storage;
});
</script>

<template>
  <div
    class="navbar bg-[#fff] shadow-sm shadow-[rgba(0, 21, 41, 0.08)] dark:shadow-[#0d0d0d]"
  >
    <topCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <Breadcrumb
      v-if="layout !== 'mix' && device !== 'mobile'"
      class="breadcrumb-container"
    />

    <mixNav v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <!-- 菜单搜索 -->
      <Search />
      <!-- 通知 -->
      <Notice id="header-notice" />
      <!-- 个人信息/退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <img
            src="https://avatars.githubusercontent.com/u/44761321?v=4"
            :style="avatarsStyle"
          />
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="handlerGetProfile">
              <IconifyIconOnline
                icon="material-symbols:edit"
                style="margin-right: 5px"
              />
              个人信息
            </el-dropdown-item>
            <el-dropdown-item @click="logout">
              <IconifyIconOnline
                icon="material-symbols:logout"
                style="margin-right: 5px"
              />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span
        class="set-icon navbar-bg-hover"
        title="打开项目配置"
        @click="onPanel"
      >
        <IconifyIconOffline :icon="Setting" />
      </span>
    </div>
    <el-dialog v-model="dialogFormVisible" title="个人信息">
      <el-form :model="form">
        <el-form-item label="姓名" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="学号" :label-width="formLabelWidth">
          <el-input v-model="form.studentID" autocomplete="off" />
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth">
          <el-input v-model="form.phoneNumber" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="form.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="班级" :label-width="formLabelWidth">
          <el-select v-model="form.class" placeholder="请选择你的专业班级">
            <el-option label="1904051" value="1904051" />
            <el-option label="1904052" value="1904052" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handlerUpdatePJrofile">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    line-height: 48px;
    height: 100%;
    float: left;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    min-width: 280px;
    height: 48px;
    align-items: center;
    color: #000000d9;
    justify-content: flex-end;

    .el-dropdown-link {
      height: 48px;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      cursor: pointer;
      color: #000000d9;

      p {
        font-size: 14px;
      }

      img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}

.logout {
  max-width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    min-width: 100%;
    display: inline-flex;
    flex-wrap: nowrap;
  }
}
</style>
