<template>
  <div>
    <div class="homework-form">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="作业名称" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="form.deadline"
            type="datetime"
            placeholder="选择截止时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="作业描述" prop="content">
          <div style="border: 1px solid #ccc">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
            <Editor
              style="height: 500px; overflow-y: hidden"
              v-model="valueHtml"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">发布作业</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { IEditorConfig } from "@wangeditor/editor";
import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { publishHomework } from "@/api/user";
defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "PublishHomework"
});
const formRef = ref(null);
const mode = ref("default");
const form = ref({
  title: "",
  deadline: "",
  content: ""
});

const rules = ref({
  title: [{ required: true, message: "请输入作业名称", trigger: "blur" }],
  deadline: [{ required: true, message: "请选择截止时间", trigger: "change" }],
  content: [{ required: true, message: "请输入作业详情", trigger: "blur" }]
});

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML
const valueHtml = ref("");

// 模拟 ajax 异步获取内容
onMounted(() => {
  // setTimeout(() => {
  //   valueHtml.value = "<p>模拟 Ajax 异步设置内容</p>";
  // }, 1500);
});

const toolbarConfig = {};
const editorConfig: Partial<IEditorConfig> = {
  placeholder: "请输入内容...",
  autoFocus: false,
  MENU_CONF: {
    uploadImage: {
      server: "http://127.0.0.1:3000/upload"
    }
  }
};

const handleCreated = editor => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
const submitForm = () => {
  // const { validate } = formRef;
  console.log(form.value.deadline);
  publishHomework({
    title: form.value.title,
    deadline: form.value.deadline,
    content: valueHtml.value,
    isSubmit: false,
    status: 0, //0:未提交 1:已提交 2:已批改
    score: null
  }).then(res => {
    console.log(res);
  });
};
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<style scoped lang="scss"></style>
