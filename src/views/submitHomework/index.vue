<script setup lang="ts">
import { ref, onMounted } from "vue";
import { dayjs, type UploadFile, ElMessage } from "element-plus";
import { getHomeworks, upload } from "@/api/user";
import type { UploadProps, UploadRequestOptions } from "element-plus";
defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "SubmitHomework"
});

const hasHomework = ref(true);
const value = ref("");
/**  快捷选择 */
const shortcuts = [
  {
    text: "上周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: "上个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  }
];

/** 作业是否提交 */
const isSubmit = ref(false);
const fileList = ref([] as UploadFile[]);
const tableData = ref([]);

//删除图片
const handleRemove = (file: UploadFile) => {
  for (let i = 0; i < fileList.value.length; i++) {
    if (fileList.value[i].uid === file.uid) {
      fileList.value.splice(i, 1);
      break;
    }
  }
};
// //预览图片
// const handlePictureCardPreview = (file: UploadFile) => {};
// //下载图片
// const handleDownload = (file: UploadFile) => {
//   console.log(file);
// };
const beforeUpload: UploadProps["beforeUpload"] = rawFile => {
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

  formData.append("file", rawFile);
  uploadFile(formData);
  return true;
};
const uploadFile = formData => {
  // 发送上传请求

  upload(formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });
};
onMounted(async () => {
  const result = await getHomeworks();

  const newRes = result.data["results"].map((item: any) => {
    return {
      title: item.title,
      content: item.content,
      deadline: dayjs(item.deadline).format("YYYY-MM-DD HH:mm:ss")
    };
  });

  tableData.value = newRes;
});
</script>

<template>
  <div>
    <h1>提交作业</h1>

    <div class="header">
      <div>
        <span class="datePickerTitle">根据日期筛选</span>
        <el-date-picker
          v-model="value"
          type="daterange"
          :shortcuts="shortcuts"
          range-separator="⇒"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </div>
    </div>
    <div class="homeTable">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" :index="index => index + 1" />
        <el-table-column prop="title" label="作业标题" width="400" />
        <el-table-column prop="content" label="作业详情" min-width="200" />
        <el-table-column prop="deadline" label="截止日期" width="180" />
        <el-table-column label="操作" min-width="100">
          <template #default="scope">
            <el-upload
              v-if="!isSubmit"
              multiple
              v-model:file-list="fileList"
              ref="uploadRef"
              class="upload-demo"
              action="#"
              :auto-upload="true"
              :show-file-list="false"
              :before-upload="beforeUpload"
            >
              <template #trigger>
                <el-button
                  type="success"
                  :disabled="
                    Date.now() - new Date(scope.row.deadline).getTime() > 0
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
              :disabled="
                Date.now() - new Date(scope.row.deadline).getTime() <= 0
                  ? true
                  : false
              "
              >查看
            </el-button>
            <el-button
              v-if="isSubmit"
              type="primary"
              :disabled="
                Date.now() - new Date(scope.row.deadline).getTime() > 0
                  ? true
                  : false
              "
              >编辑
            </el-button>
            <el-button
              v-if="isSubmit"
              type="danger"
              :disabled="
                Date.now() - new Date(scope.row.deadline).getTime() > 0
                  ? true
                  : false
              "
              >删除
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="成绩" width="100" />
      </el-table>
    </div>

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

.header {
  display: flex;
  justify-content: space-between;

  .datePickerTitle {
    margin-right: 20px;
  }
}
</style>
