# Slide Style Guide — GenUI TechTalk

---

## 1. Màu sắc (Color Palette)

| Vai trò | Tên | Hex |
|---|---|---|
| Background chính | White | `#FFFFFF` |
| Background accent slide | Purple | `#7B5EA7` |
| Background accent gradient | Purple Gradient | xem dưới |
| Primary Purple | Vivid Purple | `#7B5EA7` |
| Purple nhạt | Soft Purple | `#A78BDE` |
| Purple rất nhạt (bg tint) | Lavender | `rgba(123,94,167,0.08)` |
| Accent 2 | Cyan | `#5BC4C8` |
| Text chính | Dark Charcoal | `#2D2D2D` |
| Text phụ | Medium Gray | `#666666` |
| Text trên nền tối | White | `#FFFFFF` |
| Card shadow | Purple shadow | `rgba(123,94,167,0.12)` |
| Divider | Light Gray | `#E8E8E8` |

### Gradient accent
```
background: linear-gradient(135deg, #8B68C8 0%, #6B4E9A 100%);
```

### 2 loại slide background
- **Slide sáng (mặc định):** `#FFFFFF` — dùng cho hầu hết content slides
- **Slide tối (accent):** Purple gradient — dùng cho cover, section intro, big quote

---

## 2. Typography

| Element | Font | Size | Weight | Case | Color |
|---|---|---|---|---|---|
| Hero title (cover) | Montserrat / Inter | 60–80pt | 900 ExtraBold | UPPERCASE | White |
| Section heading (slide title) | Montserrat | 28–36pt | 800 Bold | UPPERCASE | `#7B5EA7` |
| Section heading trên nền tối | Montserrat | 28–36pt | 800 Bold | UPPERCASE | White |
| Subheading / label nhỏ dưới heading | Inter | 11–13pt | 400 Regular | Normal | `#999999` |
| Card heading | Inter / Montserrat | 16–20pt | 700 Bold | Title Case | `#2D2D2D` |
| Body | Inter | 13–15pt | 400 Regular | Normal | `#666666` |
| Body bold callout | Inter | 14–16pt | 700 Bold | Normal | `#2D2D2D` |
| Big stat / number | Montserrat | 48–72pt | 900 ExtraBold | — | `#7B5EA7` |
| Tag / badge | Inter | 10pt | 700 Bold | UPPERCASE | White trên purple bg |

### Heading + subheading pattern
Hầu hết slides dùng cặp:
```
[SLIDE TITLE — UPPERCASE — Purple]
This template is great for presentation business and personal.   ← gray, italic hoặc regular
```

---

## 3. Layout Principles

### Slide sáng (white bg)
- Header bar: **không có** full-color bar — thay vào đó heading purple nổi trên nền trắng
- Có thể thêm **thin purple underline** (3–4px) dưới slide title
- Padding đều: 60–80px mỗi cạnh
- Content area căn giữa hoặc left-aligned

### Slide tối (purple bg)
- Full bleed purple gradient
- Text trắng toàn bộ
- Dùng cho: Cover, Section intro, Big quote, Transition

### Split layout
- Một số slides dùng diagonal split hoặc vertical split 50/50:
  - Trái: white + text
  - Phải: purple bg + icon/visual
  - Hoặc ngược lại

---

## 4. Card & Component Style

### Info card (trên nền trắng)
- Background: `#FFFFFF`
- Border: none
- Shadow: `0 4px 16px rgba(123,94,167,0.12)`
- Border-radius: `8px`
- Padding: `24px`
- Icon: purple hoặc cyan, 40–48px, trên nền lavender circle

### Stat card (big numbers)
- Number: 48–72pt, ExtraBold, Purple `#7B5EA7`
- Label: 12pt, gray, dưới number
- Divider ngang nhỏ màu purple giữa các stats

### Progress bar
- Track: `#E8E8E8`
- Fill: `linear-gradient(to right, #8B68C8, #5BC4C8)`
- Height: 6–8px
- Border-radius: 999px

### Numbered badge (01, 02...)
- Background: Purple `#7B5EA7`
- Text: White, Bold
- Shape: Circle hoặc rounded square
- Size: 32–40px

---

## 5. Geometric Decorations

Style này **tối giản hơn** so với dark theme. Ít shape hơn, không dùng × mark hay donut cluster.

| Element | Dùng khi | Màu | Kích thước |
|---|---|---|---|
| Thin purple underline dưới heading | Mọi slide sáng | `#7B5EA7` | 40–60px wide, 3px |
| Circle icon background | Card với icon | Lavender `rgba(123,94,167,0.12)` | 56–64px |
| Diagonal split | Cover, section transition | Purple / White | Full height |
| Dot cluster (3 chấm) | Góc trang trí | Purple 30% opacity | 6px each |
| Thin horizontal rule | Giữa sections | `#E8E8E8` | Full width |

**Không dùng:** × marks, tam giác lớn, donut rings, geometric noise — style này clean và corporate.

---

## 6. Layout Templates

### Template A — Cover Slide (Purple bg)
```
┌─────────────────────────────────────────────┐
│  [purple gradient bg]                        │
│                                             │
│  COVER TITLE                                │
│  LARGE & BOLD                               │
│                                             │
│  Subtitle / tagline                         │
│  Speaker · Date · Event                     │
│                                             │
│  [small circle accent bottom]               │
└─────────────────────────────────────────────┘
```

### Template B — Table of Contents (White bg)
```
┌─────────────────────────────────────────────┐
│  SLIDE TITLE        [thin underline]        │
│  subtitle gray                              │
│                                             │
│ ┌─────────────┐  ┌─────────────┐           │
│ │ ● 01        │  │ ● 02        │           │
│ │ LABEL       │  │ LABEL       │           │
│ │ Short desc  │  │ Short desc  │           │
│ └─────────────┘  └─────────────┘           │
│ ┌─────────────┐                            │
│ │ ● 03        │                            │
│ │ LABEL       │                            │
│ │ Short desc  │                            │
│ └─────────────┘                            │
└─────────────────────────────────────────────┘
```

### Template C — Section Intro (Purple bg)
```
┌─────────────────────────────────────────────┐
│  [purple gradient bg]                        │
│                                             │
│  SECTION HEADING          [big number]      │
│                               01            │
│  Body text.                                 │
│  Body text.                                 │
│                                             │
│  [tag badges]                               │
└─────────────────────────────────────────────┘
```

### Template D — Cards Grid (White bg)
```
┌─────────────────────────────────────────────┐
│  SLIDE TITLE        [thin underline]        │
│  subtitle gray                              │
│                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ [●icon]  │ │ [●icon]  │ │ [●icon]  │     │
│ │  LABEL   │ │  LABEL   │ │  LABEL   │     │
│ │  desc    │ │  desc    │ │  desc    │     │
│ └──────────┘ └──────────┘ └──────────┘     │
└─────────────────────────────────────────────┘
```

### Template E — 2 Column Comparison (White bg)
```
┌─────────────────────────────────────────────┐
│  SLIDE TITLE        [thin underline]        │
│  subtitle gray                              │
│                                             │
│ ┌───────────────────┐ ┌───────────────────┐ │
│ │ COLUMN A          │ │ COLUMN B          │ │
│ │ [purple accent]   │ │ [cyan accent]     │ │
│ │ • point           │ │ • point           │ │
│ │ • point           │ │ • point           │ │
│ └───────────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────┘
```

### Template F — Timeline / Flow (White bg)
```
┌─────────────────────────────────────────────┐
│  SLIDE TITLE        [thin underline]        │
│                                             │
│ [●]──────[●]──────[●]──────[●]             │
│  label    label    label    label           │
│  desc     desc     desc     desc           │
│                                             │
│  [stat box]         [stat box]             │
└─────────────────────────────────────────────┘
```

### Template G — Big Quote / Statement (Purple bg)
```
┌─────────────────────────────────────────────┐
│  [purple gradient bg]                        │
│                                             │
│      "Quote hoặc big statement"             │
│                                             │
│         — attribution / sub-text            │
│                                             │
│      hoặc: [bảng so sánh trên nền tối]     │
└─────────────────────────────────────────────┘
```

### Template H — Full-width Table (White bg)
```
┌─────────────────────────────────────────────┐
│  SLIDE TITLE        [thin underline]        │
│                                             │
│ ┌─────┬──────────────┬────────────────────┐ │
│ │     │  Column A    │  Column B          │ │
│ ├─────┼──────────────┼────────────────────┤ │
│ │ row │  cell        │  cell              │ │
│ │ row │  cell ●      │  cell ●            │ │
│ └─────┴──────────────┴────────────────────┘ │
│  [callout bar — purple bg]                  │
└─────────────────────────────────────────────┘
```

---

## 7. Icons
- Set: Lucide Icons hoặc Heroicons — flat, outline hoặc solid
- Size: 32–48px trong card, 24px trong bullet
- Container: Circle với lavender background `rgba(123,94,167,0.12)`, size 56px
- Color: Purple `#7B5EA7` hoặc Cyan `#5BC4C8`
- Không shadow, không gradient trên icon

---

## 8. Photography & Visuals
- Photography được phép dùng — style này không restricted như dark theme
- Ảnh nên có purple color overlay nhẹ khi đặt cạnh purple elements
- Dùng ảnh người thật OK cho team / testimonial slides
- Mockup (phone/tablet): dùng clean white hoặc purple-tinted device frames

---

## 9. Slide Dimensions
- **Ratio:** 16:9
- **Size:** 1920 × 1080px (hoặc 1280 × 720px cho web)
- **Margin:** 60–80px mỗi cạnh
- **Safe zone:** 100px từ cạnh cho nội dung chính

---

## 10. Quy tắc tổng quát
- **Background mặc định là trắng** — khác với dark theme trước
- **Purple dùng làm accent**, không phải background mặc định
- **Tối đa 5 bullet points** per slide
- **Big numbers** luôn dùng Purple `#7B5EA7`, size lớn
- **Mỗi slide 1 message chính**
- **Heading luôn kèm subtitle gray** (mô tả ngắn dưới heading)
- **Card dùng shadow** thay vì border (khác dark theme)
- **Không dùng geometric noise** (× marks, triangles, donuts) — giữ clean

---

## 11. Slide Type Map

| Loại slide | Background | Heading color |
|---|---|---|
| Cover | Purple gradient | White |
| Section intro | Purple gradient | White |
| Big quote | Purple gradient | White |
| Table of contents | White | Purple |
| Content (cards, table, flow) | White | Purple |
| Comparison | White | Purple |
| Wrap-up / Q&A | Purple gradient | White |
