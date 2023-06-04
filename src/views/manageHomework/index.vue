<template>
  <div>
    <el-button @click="handlerPublishHomework" type="success"
      >发布作业</el-button
    >
    <el-button @click="handlerDownloadHomework" type="primary"
      >打包下载所有作业</el-button
    >
    <div class="homeTable">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" :index="index => index + 1" />
        <el-table-column prop="title" label="作业标题" width="300" />
        <el-table-column prop="content" label="作业详情">
          <template #default="{ row }">
            <el-button type="primary" @click="openDialog(row)"
              >查看详情</el-button
            >
          </template>
        </el-table-column>

        <el-table-column prop="deadline" label="截止日期" width="180" />
        <el-table-column label="操作" min-width="100">
          <template #default="{ row }">
            <el-button type="success" @click="handleEdit(row)">编辑 </el-button>
            <el-button type="danger" @click="handleRemove(row)"
              >删除
            </el-button>
          </template>
        </el-table-column>
        <!-- <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="danger">未提交</el-tag>
            <el-tag v-else-if="row.status === 1" type="warning">已提交</el-tag>
            <el-tag v-else type="success">已批改</el-tag>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <!-- 作业详情 -->
    <el-dialog
      v-model="dialogVisible"
      title="作业详情"
      @open="handleCreated2"
      @close="destroyEditor2"
    >
      <div style="border: 1px solid #ccc">
        <Toolbar
          style=""
          :editor="editorRef2"
          :defaultConfig="toolbarConfig2"
          mode="default"
        />
        <Editor
          style="height: 500px"
          v-model="valueHtml2"
          :defaultConfig="editorConfig2"
          mode="default"
          @onCreated="handleCreated2"
        />
      </div>
    </el-dialog>
    <!-- 发布作业 -->
    <el-dialog v-model="dialogFormVisible" title="发布作业" width="80%">
      <el-form :model="form" :rules="rules" label-width="100px">
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
              style="height: 500px"
              v-model="valueHtml"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated"
              @onDestroyed="destroyEditor"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">发布作业</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 修改已发布作业 -->
    <el-dialog v-model="dialogFormVisible2" title="修改已发布作业" width="80%">
      <el-form :model="form2" :rules="rules" label-width="100px">
        <el-form-item label="作业名称" prop="title">
          <el-input v-model="form2.title" />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="form2.deadline"
            type="datetime"
            placeholder="选择截止时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="作业描述" prop="content">
          <div style="border: 1px solid #ccc">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef3"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
            <Editor
              style="height: 500px; overflow-y: hidden"
              v-model="valueHtml3"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated3"
              @onDestroyed="destroyEditor3"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveEdit">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { IEditorConfig } from "@wangeditor/editor";
import { onMounted, ref, shallowRef } from "vue";
import {
  publishHomework,
  getHomeworks,
  deletePublishedHomework,
  updatePublishedHomework,
  downloadHomework
} from "@/api/user";
import { dayjs } from "element-plus";

defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "ManageHomework"
});
const tableData = ref([]);
const dialogVisible = ref(false);
interface IROW {
  id: number;
  title: string;
  content: string;
  deadline: string;
  isSubmit: boolean;
  status: number; //0:未提交 1:已提交 2:已批改
  score: number | null;
}
/** 查看详情 */
const openDialog = (row: IROW) => {
  dialogVisible.value = true;
  valueHtml2.value = row.content;
};
// 编辑器实例，必须用 shallowRef
const editorRef2 = shallowRef();

// 内容 HTML
const valueHtml2 = ref("<p>hello</p>");
const toolbarConfig2 = {
  toolbarKeys: []
};
const editorConfig2 = { placeholder: "请输入内容...", readOnly: true };
const handleCreated2 = editor => {
  editorRef2.value = editor; // 记录 editor 实例，重要！
};
// 组件销毁时，也及时销毁编辑器
const destroyEditor2 = () => {
  const editor = editorRef2.value;
  if (editor == null) return;
  editor.destroy();
};
//------------------------以上为查看详情的wangEditor配置
/** 获取全部作业并赋值给表格数据 */
const getAllHomeworks = async () => {
  const result = await getHomeworks();
  result.data["results"].forEach(
    item => (item.deadline = dayjs(item.deadline).format("YYYY-MM-DD HH:mm:ss"))
  );
  console.log(result.data["results"]);
  tableData.value = result.data["results"];
  return result.data["results"];
};
/** 打包下载所有作业 */
const handlerDownloadHomework = async () => {
  downloadHomework().then(response => {
    const url = window.URL.createObjectURL(response);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "homework.zip");
    document.body.appendChild(link);
    link.click();
  });
};
onMounted(() => {
  getAllHomeworks();
});

const dialogFormVisible = ref(false);
const dialogFormVisible2 = ref(false);
const mode = ref("default");
const form = ref({
  id: "",
  title: "",
  deadline: "",
  content: ""
});
const form2 = ref({
  id: "",
  title: "",
  deadline: "",
  content: ""
});

const rules = ref({
  title: [{ required: true, message: "请输入作业名称", trigger: "blur" }],
  deadline: [{ required: true, message: "请选择截止时间", trigger: "change" }],
  content: [{ required: true, message: "请输入作业详情", trigger: "blur" }]
});
/** 发布作业 */
const handlerPublishHomework = async () => {
  dialogFormVisible.value = true;
  const result = await getAllHomeworks();
  /** 获取数组对象中某个字段的最大值 */
  const getMax = (arr, key) => {
    return Math.max.apply(
      null,
      arr.map(item => {
        return item[key];
      })
    );
  };
  const nextId = getMax(result, "id") + 1;
  form.value.id = nextId;
  editorConfig.MENU_CONF.uploadImage.meta.id = nextId;
};
/** 编辑已发布作业 */
const handleEdit = async row => {
  dialogFormVisible2.value = true;
  form2.value.id = row.id;
  form2.value.title = row.title;
  form2.value.deadline = row.deadline;
  valueHtml3.value = row.content;
};
/** 保存修改 */
const saveEdit = () => {
  updatePublishedHomework({
    id: form2.value.id,
    title: form2.value.title,
    deadline: form2.value.deadline,
    content: valueHtml3.value
  }).then(_res => {
    getAllHomeworks();
    dialogFormVisible2.value = false;
  });
};
//删除作业
const handleRemove = async row => {
  deletePublishedHomework({
    params: {
      id: row["id"]
    }
  })
    .then(() => {
      getAllHomeworks();
    })
    .catch(err => {
      console.log(err);
    });
};
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
      server: "http://127.0.0.1:3000/uploadHomeworkContent",
      meta: {
        id: ""
      }
    }
  }
};

const handleCreated = editor => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
// 组件销毁时，也及时销毁编辑器
const destroyEditor = () => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
};
/** 发布作业 */
const submitForm = async () => {
  publishHomework({
    title: form.value.title,
    deadline: form.value.deadline,
    content: valueHtml.value,
    isSubmit: false,
    status: 0, //0:未提交 1:已提交 2:已批改
    score: null
  }).then(() => {
    getAllHomeworks();
    dialogFormVisible.value = false;
  });
};

//--------------------------------------------------------下面是修改作业的wangEditor配置
// 编辑器实例，必须用 shallowRef
const editorRef3 = shallowRef();
const valueHtml3 = ref("");
const handleCreated3 = editor => {
  editorRef3.value = editor; // 记录 editor 实例，重要！
};
// 组件销毁时，也及时销毁编辑器
const destroyEditor3 = () => {
  const editor = editorRef3.value;
  if (editor == null) return;
  editor.destroy();
};
</script>

<style scoped lang="scss"></style>
