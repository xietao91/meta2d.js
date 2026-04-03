// src/meta2d/autoRegister.ts

// 批量导入 /src/svg/ 下所有SVG文件
// eager: true 表示同步导入，as: 'url' 获取文件URL
const svgModules = import.meta.glob('/src/svg/*.svg', {
  eager: true,
  as: 'url',
})

// =============================================
// 生成图元绘制函数
// =============================================
const createPenDraw = (svgUrl: string) => {
  return (ctx: CanvasRenderingContext2D, pen: any) => {
    const { x, y, width, height } = pen.calculative.worldRect

    // 已缓存直接绘制
    if (pen.calculative.img) {
      ctx.drawImage(pen.calculative.img, x, y, width, height)
      return
    }

    // 加载失败标记，避免无限重试
    if (pen.calculative.imgError) return

    // 首次加载
    const img = new Image()
    img.src = svgUrl
    img.onload = () => {
      pen.calculative.img = img
      meta2d.render()
    }
    img.onerror = () => {
      pen.calculative.imgError = true
      console.error(`[meta2d] SVG加载失败: ${svgUrl}`)
    }
  }
}

// =============================================
// 生成锚点函数（上下左右各一个）
// =============================================
const createAnchors = (pen: any) => {
  const { x, y, width, height } = pen.calculative.worldRect
  return [
    { id: '0', penId: pen.id, x: x + width / 2, y },                    // 上
    { id: '1', penId: pen.id, x: x + width / 2, y: y + height },        // 下
    { id: '2', penId: pen.id, x, y: y + height / 2 },                   // 左
    { id: '3', penId: pen.id, x: x + width, y: y + height / 2 },        // 右
  ]
}

// =============================================
// 解析文件路径，提取文件名（不含扩展名）作为图元名
// /src/svg/PCS.svg => PCS
// /src/svg/battery-pack.svg => batteryPack (转驼峰)
// =============================================
const pathToName = (path: string): string => {
  const fileName = path.split('/').pop()?.replace('.svg', '') ?? ''
  // 将连字符转为驼峰：battery-pack => batteryPack
  return fileName.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

// =============================================
// 核心：批量注册所有SVG图元
// =============================================
export const registerAllSvgPens = (registerCanvasDraw: Function) => {
  const draws: Record<string, Function> = {}
  const anchors: Record<string, Function> = {}

  for (const [path, url] of Object.entries(svgModules)) {
    const name = pathToName(path)
    draws[name] = createPenDraw(url as string)
    anchors[name] = createAnchors
  }

  registerCanvasDraw(draws)
  // meta2d.registerAnchors(anchors)

  console.log('[meta2d] 已自动注册图元:', Object.keys(draws))
}

// =============================================
// 生成侧边栏数据（供 graphicGroups 使用）
// =============================================
export interface SvgPenItem {
  name: string
  svgPath: string
  icon: string
  data: {
    name: string
    width: number
    height: number
    textLeft: number
    textTop: number
    textAlign: string
    textBaseline: string
    textWidth: number
    textHeight: number
  }
}

export interface SvgPenGroup {
  name: string
  show: boolean
  list: SvgPenItem[]
}

export const generateSvgGroup = (
  groupName = '储能元件',
  defaultSize = { width: 100, height: 100 },
  // 可选：自定义每个图元的配置（key为图元名）
  customConfig: Record<string, Partial<SvgPenItem['data']>> = {}
): SvgPenGroup => {
  const list: SvgPenItem[] = []

  for (const [path, url] of Object.entries(svgModules)) {
    const name = pathToName(path)

    list.push({
      name,                    // 侧边栏显示名称（可在customConfig中覆盖）
      svgPath: url as string,  // 侧边栏图标用的SVG路径
      icon: '',
      data: {
        text: name,
        name,                  // 对应注册的图元key
        width: defaultSize.width,
        height: defaultSize.height,
        // textLeft: -0.6,
        textTop: 0,
        textAlign: 'left',
        textBaseline: 'middle',
        textWidth: 0.8,
        textHeight: 0.3,
        // 合并自定义配置
        ...customConfig[name],
      },
    })
  }

  return { name: groupName, show: true, list }
}

// =============================================
// 导出 SVG URL 映射，用于导出时转换为 data URI
// =============================================
export const getSvgUrlMap = (): Record<string, string> => {
  const urlMap: Record<string, string> = {}
  for (const [path, url] of Object.entries(svgModules)) {
    urlMap[url as string] = url as string
  }
  return urlMap
}
