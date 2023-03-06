<script setup lang="ts">
import { ref } from "vue";
import type { UploadFile } from "element-plus";

defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "SubmitHomework"
});
const disabled = ref(false);

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
/** 展开的Collapse*/
const activeName = ref(["1", "2"]);
/** 是否启用手风琴模式 */
const accordion = ref(false);
/** 作业是否提交 */
const isSubmit = ref(false);
const isSubmit2 = ref(false);
const fileList = ref([] as UploadFile[]);

/** 后端返回的截止时间 */
const deadline = ref(1977323487467);
//删除图片
const handleRemove = (file: UploadFile) => {
  for (let i = 0; i < fileList.value.length; i++) {
    if (fileList.value[i].uid === file.uid) {
      fileList.value.splice(i, 1);
      break;
    }
  }
};
//预览图片
const handlePictureCardPreview = (file: UploadFile) => {};
//下载图片
const handleDownload = (file: UploadFile) => {
  console.log(file);
};
</script>

<template>
  <div>
    <h1>提交作业</h1>
    <el-upload
      action="#"
      list-type="picture-card"
      :auto-upload="false"
      multiple
      v-model:file-list="fileList"
    >
      <template #trigger>
        <div class="trigger">
          <IconifyIconOnline
            icon="fluent-mdl2:circle-plus"
            width="60px"
            height="60px"
          />
        </div>
      </template>
      <template #file="{ file }">
        <div class="card">
          <img class="el-upload-list__item-thumbnail" :src="file.url" />
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="handlePictureCardPreview(file)"
            >
              <IconifyIconOnline icon="fluent-mdl2:zoom" />
            </span>
            <span
              v-if="!disabled"
              class="el-upload-list__item-delete"
              @click="handleDownload(file)"
            >
              <IconifyIconOnline icon="fluent-mdl2:download" />
            </span>
            <span
              v-if="!disabled"
              class="el-upload-list__item-delete"
              @click="handleRemove(file)"
            >
              <IconifyIconOnline icon="fluent-mdl2:delete" />
            </span>
          </span>
          <div class="fileName" :title="file.name">{{ file.name }}</div>
        </div>
      </template>
    </el-upload>

    <div class="header">
      <el-switch
        v-model="accordion"
        inline-prompt
        active-text="同时只能展开一项"
        inactive-text="同时可展开多项"
      />
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
    <div class="demo-collapse">
      <el-collapse v-model="activeName" :accordion="accordion">
        <el-collapse-item title="作业标题" name="1">
          <div>
            <h1>作业标题</h1>
            <div>作业内容</div>

            <el-button
              v-if="!isSubmit"
              type="success"
              :disabled="Date.now() - deadline > 0 ? true : false"
              >提交作业
            </el-button>
            <el-button
              v-else
              type="success"
              :disabled="Date.now() - deadline > 0 ? true : false"
              >查看已提交的作业
            </el-button>
            <el-button
              type="primary"
              :disabled="Date.now() - deadline > 0 ? true : false"
              >编辑已提交的作业
            </el-button>
            <el-button
              type="danger"
              :disabled="Date.now() - deadline > 0 ? true : false"
              >删除已提交的作业
            </el-button>
            <span class="deadline">截止日期：2023/02/02</span>
          </div>
        </el-collapse-item>
        <el-collapse-item title="作业标题" name="2">
          <div>
            <h1>作业标题</h1>
            <div>作业内容</div>

            <el-button
              v-if="!isSubmit2"
              type="success"
              :disabled="Date.now() - deadline > 0 ? true : false"
              >提交作业
            </el-button>
            <el-button
              v-else
              type="success"
              :disabled="Date.now() - deadline > 0 ? true : false"
              >查看已提交的作业
            </el-button>
            <el-button
              type="primary"
              :disabled="Date.now() - deadline > 0 ? true : false"
              >编辑已提交的作业
            </el-button>
            <el-button
              type="danger"
              :disabled="Date.now() - deadline > 0 ? true : false"
              >删除已提交的作业
            </el-button>
            <span class="deadline">截止日期：2023/02/02</span>
          </div>
        </el-collapse-item>
      </el-collapse>
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
.demo-collapse {
  margin-top: 20px;
  .el-collapse-item {
    ::v-deep(.el-collapse-item__header) {
      padding: 20px;
    }
    .el-collapse-item__content {
      > div ::v-deep() {
        padding: 20px;

        > span {
          float: right;
          color: red;
        }
      }
    }
  }
}
</style>
