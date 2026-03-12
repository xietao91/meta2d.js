

// 方式B：使用SVG图片绘制（推荐，最简单）
export const PCS = (ctx: CanvasRenderingContext2D, pen: any) => {
  const { x, y, width, height } = pen.calculative.worldRect
  if (!pen.calculative.img) {
    const img = new Image()
    img.src = '/src/svg/PCS.svg'
    img.onload = () => {
      pen.calculative.img = img
      meta2d.render() // 图片加载完重新渲染
    }
    return
  }
  ctx.drawImage(pen.calculative.img, x, y, width, height)
}
