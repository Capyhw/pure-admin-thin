<template>
  <div>
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

    <el-dialog v-model="dialogVisible" width="75%" center align-center>
      <!-- <img :src="dialogImageUrl" alt="Preview Image" /> -->
      <div class="mark-paper__container" ref="containerRef">
        <div class="mark-paper__wrap" ref="wrapRef">
          <div
            class="mark-paper__mask"
            :style="{ display: isLoading ? 'flex' : 'none' }"
          >
            图片加载中
          </div>
          <canvas ref="canvasRef" class="mark-paper__canvas">
            <p>很可惜，这个东东与您的电脑不搭！</p>
          </canvas>
        </div>
        <div class="mark-paper__sider">
          <div>
            选择作业：
            <el-select @change="handlePaperChange">
              <el-option-group label="17软件一班">
                <el-option value="xueshengjia">学生甲</el-option>
                <el-option value="xueshengyi">学生乙</el-option>
              </el-option-group>
              <el-option-group label="17软件二班">
                <el-option value="xueshengbing">学生丙</el-option>
              </el-option-group>
            </el-select>
          </div>
          <div class="mark-paper__action">
            <span>画布操作：</span>
            <div class="mark-paper__action">
              <el-tooltip content="撤销">
                <IconifyIconOnline
                  icon="ri:arrow-go-back-fill"
                  width="20px"
                  height="20px"
                  @Click="handleRollBack"
                />
              </el-tooltip>
              <el-tooltip content="恢复">
                <IconifyIconOnline
                  icon="ri:arrow-go-forward-fill"
                  width="20px"
                  height="20px"
                  @Click="handleRollForward"
                />
              </el-tooltip>
              <el-popconfirm
                title="确定清空画布吗？"
                @confirm="handleClearCanvasClick"
                confirm-button-text="确定"
                cancel-button-text="取消"
              >
                <template #reference>
                  <div>
                    <el-tooltip content="清空">
                      <IconifyIconOnline
                        icon="icon-park-twotone:clear"
                        width="20px"
                        height="20px"
                      />
                    </el-tooltip>
                  </div>
                </template>
              </el-popconfirm>
            </div>
          </div>
          <div class="mark-paper__action">
            <span>画布缩放：</span>
            <el-slider
              class="mark-paper__action__slider"
              :min="0.1"
              :max="2.0"
              :step="0.1"
              v-model="canvasScale"
              :format-tooltip="value => `${value.toFixed(2)}x`"
              @change="handleScaleChange"
            />
          </div>
          <div class="mark-paper__action">
            <span>画笔大小：</span>
            <el-slider
              class="mark-paper__action__slider"
              :min="1"
              :max="9"
              v-model="lineWidth"
              :format-tooltip="value => `${value}px`"
              @change="handleLineWidthChange"
            />
          </div>
          <div class="mark-paper__mousemode">
            模式选择：
            <el-radio-group
              class="radio-group"
              @change="handleMouseModeChange"
              v-model="mouseMode"
            >
              <el-radio :label="0">移动</el-radio>
              <el-radio :label="1">画笔</el-radio>
              <el-radio :label="2">橡皮擦</el-radio>
            </el-radio-group>
          </div>
          <div class="mark-paper__colorselect">
            颜色选择：
            <div class="color-picker__container" v-if="colorList">
              <el-tooltip
                v-for="(color, index) in colorList"
                :key="index"
                placement="bottom"
                :content="color"
              >
                <span
                  class="demo-color-block"
                  @click="handleColorChange(color)"
                >
                  <el-color-picker v-model="colorList[index]" />
                </span>

                />
              </el-tooltip>
            </div>
          </div>
          <el-button @click="handleSaveClick">保存图片</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
// import { Delete, Download, Plus, ZoomIn } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { UploadFile } from "element-plus";
import { onMounted } from "vue";
import { watch } from "vue";
import { urlToBase64 } from "@pureadmin/utils";
defineOptions({
  name: "CorrectHomework"
});

const dialogVisible = ref(false);
const disabled = ref(false);
const fileList = ref([] as UploadFile[]);
const isLoading = ref(false);
/** 当前位移的距离 */
const translatePointX = ref(0);
const translatePointY = ref(0);
/** 上一次位移结束的位移距离 */
const fillStartPointX = ref(0);
const fillStartPointY = ref(0);

const canvasScale = ref(1);
const canvasRef = ref(null);
const wrapRef = ref(null);
const containerRef = ref(null);
const lineColor = ref("#fa4b2a");
const lineWidth = ref(5);
const canvasHistroyList = ref([]);
const fillImageSrc = ref("");
const canvasCurrentHistory = ref(1);
const MOVE_MODE = 0;
const LINE_MODE = 1;
const ERASER_MODE = 2;
const mouseMode = ref(LINE_MODE);
const colorList = ref([
  "#fa4b2a",
  "#ffff00",
  "#ee00ee",
  "#1890ff",
  "#333333",
  "#ffffff"
]);

watch(fillImageSrc, () => {
  isLoading.value = true;
  translatePointX.value = 0;
  translatePointY.value = 0;
  fillStartPointX.value = 0;
  fillStartPointY.value = 0;
  canvasScale.value = 1;
  fillImage();
});
watch([mouseMode, canvasScale, canvasCurrentHistory], () => {
  handleCanvas();
});
watch([lineWidth, lineColor], () => {
  const { value: canvas } = canvasRef;
  const context: CanvasRenderingContext2D | undefined | null =
    canvas?.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  context.strokeStyle = lineColor.value;
  context.lineWidth = lineWidth.value;
  context.lineJoin = "round";
  context.lineCap = "round";
});
watch(canvasScale, () => {
  canvasRef.value.style.transform = `scale(${canvasScale.value},${canvasScale.value}) translate(${translatePointX.value}px,${translatePointY.value}px)`;
});
watch(canvasCurrentHistory, () => {
  const { value: canvas } = canvasRef;

  const context: CanvasRenderingContext2D | undefined | null =
    canvas?.getContext("2d");
  if (!canvas || !context || canvasCurrentHistory.value === 0) return;

  context?.putImageData(
    canvasHistroyList.value[canvasCurrentHistory.value - 1],
    0,
    0
  );
});
watch(canvasRef, () => {
  handleMouseModeChange(mouseMode.value);
});
const fillImage = async () => {
  console.log("fillImage");

  const { value: canvas } = canvasRef;
  const { value: wrap } = wrapRef;
  const context: CanvasRenderingContext2D | undefined | null =
    canvas?.getContext("2d", { willReadFrequently: true });
  const img: HTMLImageElement = new Image();

  if (!canvas || !wrap || !context) return;
  img.src = await urlToBase64(fillImageSrc.value);
  img.onload = () => {
    // 取中间渲染图片
    // const centerX: number = canvas && canvas.width / 2 - img.width / 2 || 0
    // const centerY: number = canvas && canvas.height / 2 - img.height / 2 || 0
    canvas.width = img.width;
    canvas.height = img.height;

    // 背景设置为图片，橡皮擦的效果才能出来
    canvas.style.background = `url(${img.src})`;
    context.drawImage(img, 0, 0);
    context.strokeStyle = lineColor.value;
    context.lineWidth = lineWidth.value;
    context.lineJoin = "round";
    context.lineCap = "round";

    // 设置变化基点，为画布容器中央
    canvas.style.transformOrigin = `${wrap?.offsetWidth / 2}px ${
      wrap?.offsetHeight / 2
    }px`;
    // 清除上一次变化的效果
    canvas.style.transform = "";
    const imageData: ImageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    canvasHistroyList.value = [];
    canvasHistroyList.value.push(imageData);
    canvasCurrentHistory.value = 1;
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  };
};
/** 监听移动*/
const handleMoveMode = (downX: number, downY: number) => {
  console.log("handleMoveMode");

  const { value: canvas } = canvasRef;
  const { value: wrap } = wrapRef;

  if (!canvas || !wrap || mouseMode.value !== 0) return;

  // 为容器添加移动事件，可以在空白处移动图片
  wrap.onmousemove = (event: MouseEvent) => {
    const moveX: number = event.pageX;
    const moveY: number = event.pageY;

    translatePointX.value = fillStartPointX.value + (moveX - downX);
    translatePointY.value = fillStartPointY.value + (moveY - downY);

    canvas.style.transform = `scale(${canvasScale.value},${canvasScale.value}) translate(${translatePointX.value}px,${translatePointY.value}px)`;
  };

  wrap.onmouseup = (event: MouseEvent) => {
    const upX: number = event.pageX;
    const upY: number = event.pageY;
    // 取消事件监听
    wrap.onmousemove = null;
    wrap.onmouseup = null;
    // 鼠标抬起时候，更新“上一次唯一结束的坐标”
    fillStartPointX.value = fillStartPointX.value + (upX - downX);
    fillStartPointY.value = fillStartPointY.value + (upY - downY);
  };
};
const generateLinePoint = (x: number, y: number) => {
  console.log("generateLinePoint");

  const { value: wrap } = wrapRef;

  const wrapWidth: number = wrap?.offsetWidth || 0;
  const wrapHeight: number = wrap?.offsetHeight || 0;
  // 缩放位移坐标变化规律
  // (transformOrigin - downX) / scale * (scale-1) + downX - translateX = pointX
  x -= 185;
  const pointX: number =
    ((wrapWidth / 2 - x) / canvasScale.value) * (canvasScale.value - 1) +
    x -
    translatePointX.value;
  const pointY: number =
    ((wrapHeight / 2 - y) / canvasScale.value) * (canvasScale.value - 1) +
    y -
    translatePointY.value;

  return {
    pointX,
    pointY
  };
};

const handleLineMode = (downX: number, downY: number) => {
  console.log("handleLineMode");

  const { value: canvas } = canvasRef;
  const { value: wrap } = wrapRef;
  const context: CanvasRenderingContext2D | undefined | null =
    canvas?.getContext("2d", { willReadFrequently: true });
  if (!canvas || !wrap || !context) return;
  console.log(canvas.offsetLeft, canvas.offsetTop);

  const offsetLeft: number = canvas.offsetLeft;
  const offsetTop: number = canvas.offsetTop;
  // 减去画布偏移的距离（以画布为基准进行计算坐标）
  downX = downX - offsetLeft;
  downY = downY - offsetTop;

  const { pointX, pointY } = generateLinePoint(downX, downY);
  context.globalCompositeOperation = "source-over";
  context.beginPath();
  context.moveTo(pointX, pointY);

  canvas.onmousemove = null;
  canvas.onmousemove = (event: MouseEvent) => {
    const moveX: number = event.pageX - offsetLeft;
    const moveY: number = event.pageY - offsetTop;
    const { pointX, pointY } = generateLinePoint(moveX, moveY);
    console.log(moveX, moveY, pointX, pointY);

    context.lineTo(pointX, pointY);
    context.stroke();
  };
  canvas.onmouseup = () => {
    const imageData: ImageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // 如果此时处于撤销状态，此时再使用画笔，则将之后的状态清空，以刚画的作为最新的画布状态
    if (canvasCurrentHistory.value < canvasHistroyList.value.length) {
      canvasHistroyList.value = canvasHistroyList.value.slice(
        0,
        canvasCurrentHistory.value
      );
    }
    canvasHistroyList.value.push(imageData);
    canvasCurrentHistory.value += 1;
    context.closePath();
    canvas.onmousemove = null;
    canvas.onmouseup = null;
  };
};
// 目前橡皮擦还有点问题，前端显示正常，保存图片下来，擦除的痕迹会变成白色
const handleEraserMode = (downX: number, downY: number) => {
  const { value: canvas } = canvasRef;
  const { value: wrap } = wrapRef;
  const context: CanvasRenderingContext2D | undefined | null =
    canvas?.getContext("2d", { willReadFrequently: true });
  if (!canvas || !wrap || !context) return;

  const offsetLeft: number = canvas.offsetLeft;
  const offsetTop: number = canvas.offsetTop;
  downX = downX - offsetLeft;
  downY = downY - offsetTop;

  const { pointX, pointY } = generateLinePoint(downX, downY);

  context.beginPath();
  context.moveTo(pointX, pointY);

  canvas.onmousemove = null;
  canvas.onmousemove = (event: MouseEvent) => {
    const moveX: number = event.pageX - offsetLeft;
    const moveY: number = event.pageY - offsetTop;
    const { pointX, pointY } = generateLinePoint(moveX, moveY);
    context.globalCompositeOperation = "destination-out";
    context.lineWidth = lineWidth.value;
    context.lineTo(pointX, pointY);
    context.stroke();
  };
  canvas.onmouseup = () => {
    const imageData: ImageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    if (canvasCurrentHistory.value < canvasHistroyList.value.length) {
      canvasHistroyList.value = canvasHistroyList.value.slice(
        0,
        canvasCurrentHistory.value
      );
    }
    canvasHistroyList.value.push(imageData);
    canvasCurrentHistory.value += 1;
    context.closePath();
    canvas.onmousemove = null;
    canvas.onmouseup = null;
  };
};
/** 监听鼠标滚轮，实现缩放 */
const handleCanvas = () => {
  console.log("handleCanvas");

  const { value: canvas } = canvasRef;
  const { value: wrap } = wrapRef;
  const context: CanvasRenderingContext2D | undefined | null =
    canvas?.getContext("2d", { willReadFrequently: true });

  if (!context || !wrap) return;

  // 清除上一次设置的监听，以防获取参数错误
  wrap.onmousedown = null;
  wrap.onmousedown = function (event: MouseEvent) {
    const downX: number = event.pageX;
    const downY: number = event.pageY;
    console.log("downx,downy", downX, downY);

    switch (mouseMode.value) {
      case MOVE_MODE:
        console.log("handleMoveMode");

        handleMoveMode(downX, downY);
        break;
      case LINE_MODE:
        handleLineMode(downX, downY);
        break;
      case ERASER_MODE:
        handleEraserMode(downX, downY);
        break;
      default:
        break;
    }
  };
  wrap.onmousewheel = null;
  wrap.onmousewheel = (e: WheelEvent) => {
    const { deltaY } = e;
    const newScale: number =
      deltaY > 0
        ? (canvasScale.value * 10 - 0.1 * 10) / 10
        : (canvasScale.value * 10 + 0.1 * 10) / 10;
    if (newScale < 0.1 || newScale > 2) return;
    canvasScale.value = newScale;
  };
};
/** 更改缩放 */
const handleScaleChange = (value: number) => {
  canvasScale.value = value;
};
/** 更改线宽 */
const handleLineWidthChange = (value: number) => {
  lineWidth.value = value;
};
/** 切换颜色 */
const handleColorChange = (color: string) => {
  lineColor.value = color;
};
/** 切换作业 */
const handlePaperChange = (value: string) => {
  const fillImageList = {
    xueshengjia:
      "https://img0.baidu.com/it/u=487873682,496212189&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667",
    xueshengyi:
      "https://img2.baidu.com/it/u=3192336871,2242501657&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
    xueshengbing:
      "https://5b0988e595225.cdn.sohucs.com/images/20200310/4e3b1ff6b04f480ea6c227ab161b9bf0.jpeg"
  };
  fillImageSrc.value = fillImageList[value];
  handleCanvas();
};
/** 撤销 */
const handleRollBack = () => {
  const isFirstHistory: boolean = canvasCurrentHistory.value === 1;
  if (isFirstHistory) return;
  canvasCurrentHistory.value -= 1;
};
/** 恢复 */
const handleRollForward = () => {
  const isLastHistory: boolean =
    canvasCurrentHistory.value === canvasHistroyList.value.length;
  if (isLastHistory) return;
  canvasCurrentHistory.value += 1;
};
/** 清空涂鸦 */
const handleClearCanvasClick = () => {
  const { value: canvas } = canvasRef;
  const context: CanvasRenderingContext2D | undefined | null =
    canvas?.getContext("2d", { willReadFrequently: true });
  if (!canvas || !context || canvasCurrentHistory.value === 0) return;

  // 清空画布历史
  canvasHistroyList.value = [canvasHistroyList.value[0]];
  canvasCurrentHistory.value = 1;

  ElMessage.success("画布清除成功！");
};
/** 切换鼠标功能 */
const handleMouseModeChange = (value: number) => {
  const { value: canvas } = canvasRef;
  const { value: wrap } = wrapRef;

  mouseMode.value = value;

  if (!canvas || !wrap) return;
  switch (value) {
    case MOVE_MODE:
      canvas.style.cursor = "move";
      wrap.style.cursor = "move";
      break;
    case LINE_MODE:
      canvas.style.cursor = `url('https://api.iconify.design/fxemoji:pencil.svg') 6 26, pointer`;
      wrap.style.cursor = "default";
      break;
    case ERASER_MODE:
      ElMessage.warning("橡皮擦功能尚未完善，保存图片会出现错误");
      canvas.style.cursor = `url('https://api.iconify.design/mdi:eraser.svg') 6 26, pointer`;
      wrap.style.cursor = "default";
      break;
    default:
      canvas.style.cursor = "default";
      wrap.style.cursor = "default";
      break;
  }
};

const handleSaveClick = () => {
  const { value: canvas } = canvasRef;
  // 可存入数据库或是直接生成图片
  console.log(canvas?.toDataURL());
};
//删除图片
const handleRemove = (file: UploadFile) => {
  // console.log(file);
  for (let i = 0; i < fileList.value.length; i++) {
    if (fileList.value[i].uid === file.uid) {
      fileList.value.splice(i, 1);
      break;
    }
  }
};
//预览图片
const handlePictureCardPreview = (file: UploadFile) => {
  fillImageSrc.value = file.url!;
  dialogVisible.value = true;
};
//下载图片
const handleDownload = (file: UploadFile) => {
  console.log(file);
};
onMounted(() => {
  // handleCanvas();
});
</script>
<style lang="scss" scoped>
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

.mark-paper__container {
  display: flex;
  justify-content: space-between;
  .mark-paper__wrap {
    overflow: hidden;
  }
  .mark-paper__sider {
    margin-left: 10px;
    .mark-paper__action {
      display: flex;
      align-items: center;
      .mark-paper__action__slider {
        width: 100px;
      }
    }
  }
}
</style>
