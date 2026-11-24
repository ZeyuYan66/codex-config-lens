# THoleDef

> 返回 [REFERENCE 类型索引](../../documents/REFERENCE.md)

## 定义

孔定义，null 表示无孔

⚠️ **本类型不是图元、不占任何一行数据** —— 它是焊盘（[TPcbPad](../PCB/pad.md)）`hole` 字段的结构，
盘上并不存在「一条独立的孔记录」，读到 `hole` 时按下面的结构解释即可。

⚠️ 焊盘上的孔**通常只出现在多层焊盘**（`layerId` 为 12）：写盘侧只在多层焊盘上输出
`hole`，读盘侧不设该门槛（历史数据里非多层焊盘也可能带孔）。
是否为**金属化孔**看所属焊盘的 `plated` 字段；本类型只描述孔的形状与尺寸。

## 字段

| 字段 | 类型 | 必需 | 约束 | 说明 |
|------|------|------|------|------|
| holeType | [ETHoleType](./et-hole-type.md) | ✓ | - | 取值范围：ROUND（圆形孔）、RECT（方孔）、SLOT（挖槽）、ROUND_RECT（圆角矩形） |
| width | `number` | ✓ | - | 宽：**单位 mil**，编码为 `pad.holeLength × 10`。 ⚠️ **不要把它与 `height` 当成同一个矩形的宽高**，两者不是同一维度： - `SLOT`（挖槽）：本字段是**槽长**，`height` 是孔径（槽长 ≥ 孔径）； - `ROUND`（圆孔）：**本字段与 `height` 相等、都是孔直径**——圆孔的 `holeLength` 中途会被强制成直径（`holeShape == CIRCLE` 时 `holeLength = diameter`），真实数据里 圆孔只有 `33.4646/33.4646` 这种「宽高相等」与 `0/0` 两种形态，**不存在** 「宽 0 而高为孔径」的组合； - **`width` 与 `height` 同为 0** 表示该焊盘没有孔。 |
| height | `number` | ✓ | - | 高：**单位 mil**，编码为 `pad.holeRadius × 20`（即半径 ×2 ×10），也就是**孔直径** |
| cornerRadius | `number` |  | - | 圆角矩形（`ROUND_RECT`）- 圆角，**单位 mil**（编码为 `holeCornerRadius × 10`） |

## JSON Schema

→ [查看 JSON Schema](../../schemas/t-hole-def.json)

## 校验规则

| 规则 | 级别 | 说明 |
|------|------|------|
| required | ERROR | `holeType`: 必需字段 |
| required | ERROR | `width`: 必需字段 |
| required | ERROR | `height`: 必需字段 |
| enum | ERROR | `holeType`: 允许值: ROUND, RECT, SLOT, ROUND_RECT |

## 关联图元

_无关联图元_

## 示例

→ [查看示例](../../examples/REFERENCE/t-hole-def.md)

