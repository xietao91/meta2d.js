<template>
  <div class="graphics">
    <t-collapse :defaultExpandAll="true">
      <t-collapse-panel :header="item.name" v-for="item in graphicGroups" :key="item.name">
        <template v-for="elem in item.list">
          <div class="graphic" :draggable="true" @dragstart="dragStart($event, elem)"
            @click.prevent="dragStart($event, elem)">
            <svg v-if="elem.icon" class="l-icon" aria-hidden="true">
              <use :xlink:href="'#' + elem.icon"></use>
            </svg>
            <img v-else="elem.svgPath" :src="elem.svgPath" />

            <p :title="elem.name">{{ elem.name }}</p>
          </div>
        </template>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<script lang="ts" setup>
import { generateSvgGroup } from '@/utils/autoRegister';

// const graphicGroups = [
//   {
//     name: '储能元件',
//     show: true,
//     list: [
//       {
//         name: 'PCS',
//         svgPath: '/src/svg/PCS.svg',
//         icon: '',
//         data: {
//           text: 'PCS',
//           width: 100,
//           height: 100,
//           name: 'PCS',
//           borderRadius: 0.5,
//           // 文字位置控制
//           textAlign: 'left',          // 水平对齐：left / center / right
//           textBaseline: 'middle',     // 垂直对齐：top / middle / bottom

//           // 关键：把文字移到图元左侧外部
//           textLeft: -0.6,             // 负值 = 向左偏移，单位是相对宽度的比例
//           textTop: 0,                 // 垂直方向微调
//           textWidth: 0.8,             // 文字区域宽度（相对值）
//           textHeight: 0.3,
//         },
//       },
//       {
//         name: '保护间隙',
//         svgPath: '/src/svg/保护间隙.svg',
//         icon: '',
//         data: {
//           text: '保护间隙',
//           width: 100,
//           height: 100,
//           name: '保护间隙',
//           borderRadius: 0.5,
//           // 文字位置控制
//           textAlign: 'left',          // 水平对齐：left / center / right
//           textBaseline: 'middle',     // 垂直对齐：top / middle / bottom

//           // 关键：把文字移到图元左侧外部
//           textLeft: -0.6,             // 负值 = 向左偏移，单位是相对宽度的比例
//           textTop: 0,                 // 垂直方向微调
//           textWidth: 0.8,             // 文字区域宽度（相对值）
//           textHeight: 0.3,
//         },
//       },
//     ],
//   },
// ];

const graphicGroups = [generateSvgGroup()]; // 从 /src/svg/ 自动生成图元列表
const dragStart = (e: any, elem: any) => {
  if (!elem) {
    return;
  }
  e.stopPropagation();

  // 拖拽事件
  if (e instanceof DragEvent) {
    // 设置拖拽数据
    e.dataTransfer?.setData('Meta2d', JSON.stringify(elem.data));
  } else {
    // 支持单击添加图元。平板模式
    meta2d.canvas.addCaches = [elem.data];
  }
};
</script>
<style lang="postcss" scoped>
.graphics {
  height: calc(100vh - 80px);
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
  z-index: 2;

  :deep(.t-collapse) {
    border-top: none;

    .t-collapse-panel__content {
      background-color: var(--color-background-active);
      padding: 20px 4px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      grid-row-gap: 12px;
    }

    .graphic {
      position: relative;
      padding: 10px 0;
      border-radius: 2px;
      border: 1px solid transparent;

      &:hover {
        cursor: pointer;
        border-color: var(--color-primary);
      }

      p {
        margin-top: 6px;
        padding: 0 8px;
        text-align: center;
        font-size: 12px;
        height: 12px;
        line-height: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        word-break: break-all;
        -webkit-box-orient: vertical;
      }

      svg {
        color: var(--color);
        height: 28px;
        width: 100%;
        margin: auto;
      }
    }
  }
}
</style>
