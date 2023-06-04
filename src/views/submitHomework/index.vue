<script setup lang="ts">
import {
  ref,
  onMounted,
  shallowRef,
  onBeforeMount,
  getCurrentInstance
} from "vue";
import { dayjs, type UploadFile, ElMessage } from "element-plus";
import { useNav } from "@/layout/hooks/useNav";
import {
  getHomeworks,
  submitHomework,
  deleteSubmitedHomework,
  getHomeworkStates,
  getProfile,
  getHomeworkImages,
  getScore
} from "@/api/user";
import type { UploadRawFile } from "element-plus";
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "SubmitHomework"
});
const { username } = useNav();
const hasHomework = ref(true);
const fileList = ref([] as UploadFile[]);
const tableData = ref([]);
const dialogVisible = ref(false);
let storage = null;

//删除图片
const handleRemove = async row => {
  deleteSubmitedHomework({
    params: {
      class: storage.profile.class,
      id: row["id"],
      studentID: storage.profile.studentID
    }
  })
    .then(() => {
      getAllHomeworks();
    })
    .catch(err => {
      console.log(err);
    });
};
//上传图片
const beforeUpload = (rawFile: UploadRawFile, row: IROW) => {
  const type = ["image/jpeg", "image/jpg", "image/png"];
  if (type.indexOf(rawFile.type) === -1) {
    ElMessage.error("上传的文件必须是JPG、JPEG、PNG三种之一!");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error("图片大小不能超过10MB!");
    return false;
  }
  const formData = new FormData();
  console.log(rawFile);

  formData.append("file", rawFile, encodeURIComponent(rawFile.name));
  for (const key in row) {
    formData.append(key, row[key]);
  }
  for (const key in storage.profile) {
    formData.append(key, storage.profile[key]);
  }
  uploadFile(formData);
  return false;
};
const uploadFile = formData => {
  // 发送上传请求
  submitHomework(formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
    .then(_response => {
      getAllHomeworks();
    })
    .catch(error => {
      console.log(error);
    });
};
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
  valueHtml.value = row.content;
};
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
// 内容 HTML
const valueHtml = ref("<p>hello</p>");
const toolbarConfig = {
  toolbarKeys: []
};
const editorConfig = { placeholder: "请输入内容...", readOnly: true };
const handleCreated = editor => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
/** 查看批改后的作业 */
const handleOpen = (row: IROW) => {
  showViewer.value[row.id] = true;
  allImgList.forEach(item => {
    if (item.id == row.id) {
      imgList.value = item.imgList;
    }
  });
};
/** 获取全部作业并赋值给表格数据 */
const scoreObj = ref({});
const getAllHomeworks = async () => {
  const { data } = await getProfile({
    params: {
      username: username.value
    }
  });
  const { studentID } = data["results"][0];
  const homeworkStates = await getHomeworkStates({
    params: {
      studentID
    }
  });
  const result = await getHomeworks();
  const scoreResult = await getScore({
    params: {
      studentID
    }
  });
  scoreResult.data["results"].forEach(item => {
    scoreObj.value[item.homeworkID] = item.score;
  });
  result.data["results"].forEach(item => {
    item.deadline = dayjs(item.deadline).format("YYYY-MM-DD HH:mm:ss");
    item.score = scoreObj.value[item.id];
    //从这个数组中返回homeworkID==ID的那个对象
    const homeworkState = homeworkStates.data["results"].find(
      homeworkState => homeworkState.homeworkID == item.id
    );
    if (homeworkState) {
      item.status = homeworkState.states;
      item.isSubmit = true;
    } else {
      item.status = 0;
      item.isSubmit = false;
    }
  });
  tableData.value = result.data["results"];
};
onBeforeMount(() => {
  storage =
    getCurrentInstance()!.appContext.app.config.globalProperties.$storage;
});
const allImgList = [];
const imgList = ref([]);
const showViewer = ref({});
onMounted(async () => {
  await getAllHomeworks();
  const { result } = await getHomeworkImages();
  const res = [];
  const { class: class_, studentID } = storage.profile;
  result.forEach(item => {
    tableData.value.forEach(item2 => {
      //找到作业
      if (item2.id == item.id) {
        item.children.forEach(item3 => {
          //找到班级
          if (item3.id == class_) {
            item3.children.forEach(item4 => {
              //找到学生
              if (item4.id == studentID) {
                res.push({
                  id: item.id,
                  imgPath: item4.images
                });
              }
            });
          }
        });
      }
    });
  });

  res.forEach(item => {
    showViewer.value[item.id] = false;
    const tmp_imgList = [];
    item.imgPath.forEach(item2 => {
      tmp_imgList.push(item2.path.replace("public", "http://127.0.0.1:3000/"));
    });
    allImgList.push({
      id: item.id,
      imgList: [...tmp_imgList]
    });
  });
});
// 组件销毁时，也及时销毁编辑器
const destroyEditor = () => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
};
</script>

<template>
  <div>
    <h1>提交作业</h1>

    <div class="homeTable">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" :index="index => index + 1" />
        <el-table-column prop="title" label="作业标题" width="300" />
        <el-table-column prop="content" label="作业详情">
          <template #default="{ row }">
            <el-button @click="openDialog(row)">查看详情</el-button>
          </template>
        </el-table-column>

        <el-table-column prop="deadline" label="截止日期" width="180" />
        <el-table-column label="操作" min-width="100">
          <template #default="{ row }">
            <el-upload
              v-if="!row.isSubmit"
              multiple
              v-model:file-list="fileList"
              ref="uploadRef"
              class="upload-demo"
              action="#"
              :auto-upload="true"
              :show-file-list="false"
              :before-upload="raw => beforeUpload(raw, row)"
            >
              <template #trigger>
                <el-button
                  type="success"
                  :disabled="
                    Date.now() - new Date(row.deadline).getTime() > 0
                      ? true
                      : false
                  "
                  >提交
                </el-button>
              </template>
            </el-upload>

            <el-button
              v-else
              type="success"
              :disabled="row.status != 2"
              @click="handleOpen(row)"
              >查看
            </el-button>

            <el-button
              v-if="row.isSubmit"
              type="danger"
              :disabled="
                Date.now() - new Date(row.deadline).getTime() > 0 ? true : false
              "
              @click="handleRemove(row)"
              >删除
            </el-button>
            <div class="demo-image__preview">
              <el-image-viewer
                v-if="showViewer[row.id]"
                @close="showViewer[row.id] = false"
                :teleported="true"
                :url-list="imgList"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status == 0" type="danger">未提交</el-tag>
            <el-tag v-else-if="row.status == 1" type="warning">已提交</el-tag>
            <el-tag v-else type="success">已批改</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="100" />
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="作业详情"
      @open="handleCreated"
      @close="destroyEditor"
    >
      <div style="border: 1px solid #ccc">
        <Toolbar
          style=""
          :editor="editorRef"
          :defaultConfig="toolbarConfig"
          mode="default"
        />
        <Editor
          style="height: 500px"
          v-model="valueHtml"
          :defaultConfig="editorConfig"
          mode="default"
          @onCreated="handleCreated"
        />
      </div>
    </el-dialog>
    <!-- 当未发布作业时兜底显示 -->
    <el-empty v-if="!hasHomework" description="老师当前还未发布作业" />
  </div>
</template>

<style scoped lang="scss">
$cardWidth: 300px;

::v-deep(.el-upload-list--picture-card) {
  .el-upload-list__item {
    width: $cardWidth;
    .card {
      width: $cardWidth;
      overflow: hidden;

      .el-upload-list__item-thumbnail {
        height: 80%;
        width: 100%;
      }
      .el-upload-list__item-actions {
        height: 80%;
      }
      .fileName {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
      }
    }
  }
  .el-upload--picture-card {
    width: $cardWidth;
  }
}
</style>
